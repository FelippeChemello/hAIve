from moviepy.editor import VideoFileClip
from moviepy.video.fx.all import fadein, fadeout
from proglog import ProgressBarLogger

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

def cut_video(video_filename, start, end, output_filename):
    print(f'Cutting video from {start} to {end}')
    start = float(start)
    end = float(end)

    video = VideoFileClip(video_filename)
    video_cut = video.subclip(start, end)
    video_faded_in = fadein(video_cut, 1)
    video_faded_out = fadeout(video_faded_in, 1)

    video_faded_out.write_videofile(output_filename, codec='libx264', audio_codec='aac', logger=logger)

    return output_filename