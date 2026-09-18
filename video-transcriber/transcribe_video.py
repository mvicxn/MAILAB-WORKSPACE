import argparse
import sys
import tempfile
from pathlib import Path
from typing import Iterable

from faster_whisper import WhisperModel
from yt_dlp import YoutubeDL


def timestamp(seconds: float) -> str:
    milliseconds = int(round(seconds * 1000))
    hours, remainder = divmod(milliseconds, 3_600_000)
    minutes, remainder = divmod(remainder, 60_000)
    seconds, milliseconds = divmod(remainder, 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02},{milliseconds:03}"


def write_txt(path: Path, segments: Iterable[object]) -> None:
    with path.open("w", encoding="utf-8") as output:
        for segment in segments:
            text = segment.text.strip()
            if text:
                output.write(f"[{timestamp(segment.start)[:-4]}] {text}\n")


def write_srt(path: Path, segments: Iterable[object]) -> None:
    with path.open("w", encoding="utf-8") as output:
        for index, segment in enumerate(segments, start=1):
            text = segment.text.strip()
            if not text:
                continue
            output.write(f"{index}\n")
            output.write(
                f"{timestamp(segment.start)} --> {timestamp(segment.end)}\n"
            )
            output.write(f"{text}\n\n")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Transcreve vídeo, áudio ou vídeo do YouTube localmente."
    )
    parser.add_argument(
        "input",
        help="Caminho do vídeo/áudio ou URL do YouTube.",
    )
    parser.add_argument(
        "--model",
        default="small",
        choices=("tiny", "base", "small", "medium", "large-v3"),
        help="Modelo Whisper. 'small' é um bom equilíbrio para português.",
    )
    parser.add_argument(
        "--language",
        default="pt",
        help="Idioma do áudio (pt, en...). Use 'auto' para detectar.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Pasta de saída. Por padrão, usa a pasta do arquivo.",
    )
    parser.add_argument(
        "--device",
        default="cpu",
        choices=("cpu", "cuda"),
        help="Dispositivo de execução. CPU funciona sem placa NVIDIA.",
    )
    parser.add_argument(
        "--compute-type",
        default="int8",
        help="Tipo de cálculo. Para CPU, int8 é o padrão recomendado.",
    )
    return parser.parse_args()


def is_youtube_url(value: str) -> bool:
    return value.startswith(("https://www.youtube.com/", "https://youtube.com/", "https://youtu.be/"))


def download_youtube_audio(url: str, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    options = {
        "format": "bestaudio/best",
        "outtmpl": str(output_dir / "%(id)s.%(ext)s"),
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
    }
    try:
        with YoutubeDL(options) as downloader:
            info = downloader.extract_info(url, download=True)
            downloaded = Path(downloader.prepare_filename(info))
    except Exception as error:
        raise RuntimeError(f"Não foi possível baixar o áudio do YouTube: {error}") from error
    if not downloaded.is_file():
        raise RuntimeError("O áudio foi baixado, mas o arquivo não foi encontrado.")
    return downloaded


def main() -> int:
    args = parse_args()
    is_youtube = is_youtube_url(args.input)
    if is_youtube:
        output_dir = (args.output_dir or Path("transcricoes")).expanduser().resolve()
    else:
        input_path = Path(args.input).expanduser().resolve()
        if not input_path.is_file():
            print(f"Arquivo não encontrado: {input_path}", file=sys.stderr)
            return 1
        output_dir = (args.output_dir or input_path.parent).expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    language = None if args.language == "auto" else args.language

    temporary_dir = None
    if is_youtube:
        temporary_dir = tempfile.TemporaryDirectory(prefix="mai-youtube-")
        print("Baixando somente o áudio do YouTube...")
        input_path = download_youtube_audio(args.input, Path(temporary_dir.name))
    else:
        input_path = Path(args.input).expanduser().resolve()

    print(f"Carregando modelo Whisper: {args.model}")
    model = WhisperModel(
        args.model,
        device=args.device,
        compute_type=args.compute_type,
    )
    print(f"Transcrevendo: {input_path.name}")
    segments, info = model.transcribe(
        str(input_path),
        language=language,
        vad_filter=True,
        beam_size=5,
    )
    segments = list(segments)
    stem = input_path.stem
    txt_path = output_dir / f"{stem}.txt"
    srt_path = output_dir / f"{stem}.srt"
    write_txt(txt_path, segments)
    write_srt(srt_path, segments)

    detected = info.language or args.language
    print(f"Idioma: {detected}")
    print(f"Texto: {txt_path}")
    print(f"Legenda: {srt_path}")
    if temporary_dir is not None:
        temporary_dir.cleanup()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
