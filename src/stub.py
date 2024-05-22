from modal import Stub, Volume

from src.image import imageApp

stub = Stub("youtube_media_toolkit", image=imageApp)
stub.volume = Volume.new()