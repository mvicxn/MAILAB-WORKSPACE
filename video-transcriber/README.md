# 🎥 Transcritor local de vídeo e YouTube

Ferramenta privada para transcrever vídeos e áudios com Whisper. O arquivo
fica no computador e não é enviado para a xAI, Discord, GitHub ou outro
serviço por padrão.

## O que ela gera

Aceita arquivos locais ou links do YouTube. Para um link do YouTube, baixa
somente o áudio temporariamente, transcreve no computador e remove o áudio
baixado ao terminar.

Para cada fonte, cria:

- `.txt`: transcrição com horário aproximado;
- `.srt`: legenda compatível com editores de vídeo e players.

## Instalação

Na primeira vez:

```bash
cd /home/mm-lab-corp/MAILAB-WORKSPACE
python3 -m venv video-transcriber/.venv
. video-transcriber/.venv/bin/activate
python -m pip install -r video-transcriber/requirements.txt
```

O modelo Whisper será baixado na primeira execução. Isso pode ocupar espaço
e levar alguns minutos.

## Uso com YouTube

```bash
cd /home/mm-lab-corp/MAILAB-WORKSPACE
. video-transcriber/.venv/bin/activate
python video-transcriber/transcribe_video.py \
  "https://www.youtube.com/watch?v=ID_DO_VIDEO"
```

Os resultados vão para `transcricoes/` por padrão. Para escolher a pasta:

```bash
python video-transcriber/transcribe_video.py \
  "https://youtu.be/ID_DO_VIDEO" \
  --output-dir transcricoes
```

## Uso com arquivo local

```bash
cd /home/mm-lab-corp/MAILAB-WORKSPACE
. video-transcriber/.venv/bin/activate
python video-transcriber/transcribe_video.py "/caminho/video.mp4"
```

Português é o padrão. Para deixar o programa detectar o idioma:

```bash
python video-transcriber/transcribe_video.py video.mp4 --language auto
```

Modelos:

```bash
--model tiny    # mais rápido, menor precisão
--model base    # rápido
--model small   # equilíbrio recomendado
--model medium  # mais precisão, mais lento
--model large-v3 # maior precisão, mais pesado
```

Exemplo com pasta de saída:

```bash
python video-transcriber/transcribe_video.py video.mp4 \
  --model small \
  --output-dir transcricoes
```

## Observações

- CPU funciona; uma GPU NVIDIA pode acelerar com `--device cuda`.
- A qualidade depende do áudio, ruído, sotaque e sobreposição de vozes.
- Revise nomes, números, termos técnicos e trechos importantes.
- Não coloque vídeos ou transcrições com dados sensíveis no GitHub.
- A ferramenta não faz tradução; ela transcreve o idioma falado.
- Use somente vídeos que você tem autorização para baixar e processar.
