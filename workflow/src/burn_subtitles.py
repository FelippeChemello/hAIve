from typing import List
import ffmpeg

def filter_transcription(transcription: List[dict], start: float, end: float, speed: float) -> List[dict]:
    filtered_transcription = [item for item in transcription if item['start'] >= start and item['end'] <= end]
    for item in filtered_transcription:
        item['start'] = (item['start'] - start) / speed
        item['end'] = (item['end'] - start) / speed
        item['words'] = [word for word in item['words'] if 'start' in word and 'end' in word]
        for word in item['words']:
            word['start'] = (word['start'] - start) / speed
            word['end'] = (word['end'] - start) / speed
    return filtered_transcription

def to_time(seconds: float) -> str:
    # 00:00:00.000
    return f"{int(seconds // 3600):02d}:{int((seconds % 3600) // 60):02d}:{seconds % 60:.3f}"

def burn_subtitles(
    video_filename: str, 
    moment_filename: str, 
    raw_transcription: List[dict], 
    start: float, 
    end: float, 
    speed: float, 
    orientation: str
) -> str:
    filtered_transcription = filter_transcription(raw_transcription, start, end, speed)
    output_filename = f"{moment_filename}_subtitled.mp4"
    subtitles_filename = f"{moment_filename}.srt"

    with open(subtitles_filename, "w") as f:
        i = 1
        for item in filtered_transcription:
            for word in item['words']:
                if word['start'] and word['end']:
                    f.write(f"{i}\n")
                    f.write(f"{to_time(word['start'])} --> {to_time(word['end'])}\n")
                    f.write(f"{word['word']}\n")
                    f.write("\n")
                    i += 1

    if orientation == 'landscape':
        subtitle_position = 2
    else:
        subtitle_position = 10

    ffmpeg.input(video_filename).output(output_filename, vf=f"subtitles={subtitles_filename}:force_style='Alignment={subtitle_position},Fontsize=24'").run(overwrite_output=True)

    return output_filename
