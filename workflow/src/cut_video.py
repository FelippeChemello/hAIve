import random
import moviepy.video.fx.all as vfx
from moviepy.editor import VideoFileClip, clips_array
from moviepy.video.fx.all import fadein, fadeout
from proglog import ProgressBarLogger

def get_retention_video(duration):
    retention_video = VideoFileClip('assets/minecraft_parkour.mp4')
    retention_video_duration = retention_video.duration

    if duration > retention_video_duration:
        raise ValueError("Duration exceeds the video's total length")

    random_start = random.uniform(0, retention_video_duration - duration)
    random_end = random_start + duration

    return retention_video.subclip(random_start, random_end)

class MyBarLogger(ProgressBarLogger):
    def callback(self, **changes):
        # Every time the logger message is updated, this function is called with
        # the `changes` dictionary of the form `parameter: new value`.
        for (parameter, value) in changes.items():
            print('Parameter %s is now %s' % (parameter, value))
    
    def bars_callback(self, bar, attr, value, old_value=None):
        # Every time the logger progress is updated, this function is called
        percentage = (value / self.bars[bar]['total']) * 100
        bar_length = 50
        block = int(round(bar_length * percentage / 100))
        progress_bar = "#" * block + "-" * (bar_length - block)
        print(f'\r{bar}: [{progress_bar}] {percentage:.2f}%', end='')

logger = MyBarLogger()

def cut_video(video_filename, start, end, output_filename, orientation):
    print(f'Cutting video from {start} to {end}')
    start = float(start)
    end = float(end)
    duration = end - start
    speed = 1

    video = VideoFileClip(video_filename)
    video_cut = video.subclip(start, end)
    video_faded_in = fadein(video_cut, 1)
    video_faded_out = fadeout(video_faded_in, 1)

    if orientation == 'portrait':
        crop_x = (video_faded_out.size[0] - video_faded_out.size[1]) / 2
        cropped_video = video_faded_out.crop(x1=crop_x, x2=video_faded_out.size[0] - crop_x)

        retention_video = get_retention_video(duration)
        retention_video_crop_x = (retention_video.size[0] - retention_video.size[1]) / 2
        retention_video_cropped = retention_video.crop(x1=retention_video_crop_x, x2=retention_video.size[0] - retention_video_crop_x)
        retention_video_faded_in_out = fadein(fadeout(retention_video_cropped, 1), 1)

        combined_videos = clips_array([[cropped_video], [retention_video_faded_in_out]])

        if duration > 60 and duration <= 120:
            speed = duration / 59 # 59 seconds is the maximum length for portrait orientation
            combined_videos = combined_videos.fx(vfx.speedx, speed)
        elif duration > 120:
            raise ValueError(f"Duration exceeds maximum length for portrait orientation: {duration} seconds")

        combined_videos.write_videofile(output_filename, codec='libx264', audio_codec='aac', logger=logger)
    else:
        video_faded_out.write_videofile(output_filename, codec='libx264', audio_codec='aac', logger=logger)

    return output_filename, duration / speed, speed