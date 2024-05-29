from PIL import Image, ImageFont, ImageDraw
import cv2
import numpy as np
from rembg import remove as removeBG 
import string

width, height = 1280, 720

def extract_th_frame(video_path, frame_number = 30):
    cap = cv2.VideoCapture(video_path)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
    ret, frame = cap.read()
    cap.release()
    return frame
    
def detect_face_and_landmarks(video_path):
    frame_to_detect = 0

    faces = []
    while len(faces) == 0 or len(faces) > 1:
        frame_to_detect += 30
        frame = extract_th_frame(video_path, frame_to_detect)

        detector = cv2.CascadeClassifier("assets/haarcascade_frontalface_alt2.xml")
        faces = detector.detectMultiScale(frame)
        print(f"Found {len(faces)} faces in the frame {frame_to_detect}")

    landmark_detector  = cv2.face.createFacemarkLBF()
    landmark_detector.loadModel("assets/lbfmodel.yaml")
    _, landmarks = landmark_detector.fit(frame, faces)
    return faces[0], landmarks[0], frame

def get_gaze_direction(landmarks):
    left_eye = np.mean(landmarks[0][36:42], axis=0)
    right_eye = np.mean(landmarks[0][42:48], axis=0)
    nose_tip = landmarks[0][30]
    # Calculate vector from midpoint of eyes to nose tip
    eyes_midpoint = (left_eye + right_eye) / 2
    vector_to_nose = nose_tip - eyes_midpoint
    # Calculate the angle of the vector in degrees
    angle = np.arctan2(vector_to_nose[1], vector_to_nose[0]) * 180 / np.pi
    print(f"The angle between the nose and the eyes midpoint is {angle} degrees")
    # Determine the direction based on the angle
    if angle <= 90:
        return "left"
    else:
        return "right"

def get_text_size(lines, font):
    font_left, font_top, font_right, font_bottom = font.getbbox("hg")
    height = (len(lines) * (font_bottom - font_top)) + 16

    return height

def text_wrap(text, width=800, height=600, font_path='arial.ttf'):
    font_size = 128
    font = ImageFont.truetype(font_path, font_size)
    lines = wrap_text_to_lines(text, font, width)

    while get_text_size(lines, font) > height:
        print(f"Font size {font_size} is too big.")
        font_size -= 1
        font = ImageFont.truetype(font_path, font_size)
        lines = wrap_text_to_lines(text, font, width)
    
    return lines, font_size

def wrap_text_to_lines(text, font, width):
    lines = []
    if font.getbbox(text)[2] <= width: 
        lines.append(text)
    else:
        words = text.split(' ')
        i = 0
        while i < len(words):
            line = ''
            while i < len(words) and font.getbbox(line + words[i] + " ")[2] <= width: 
                line += words[i] + " "
                i += 1
            if not line:
                line = words[i]
                i += 1
            lines.append(line)
    return lines

def generate_thumbnail(video_filename, text, thumbnail_filename = 'thumbnail.png', color = {"bg": "#151B25", "fg": "#214358", "text": "#fcbe11"}):
    print("Generating thumbnail")
    face, landmarks, frame = detect_face_and_landmarks(video_filename)
    direction = get_gaze_direction(landmarks)
    print("The person is looking to the", direction)
    
    face_x, y, face_w, h = face
    if direction == "right":
        paste_x = width - face_x
    else:
        paste_x = face_x - width

    image = Image.new('RGB', (width, height), color=color["bg"])
    d = ImageDraw.Draw(image)

    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    frame = removeBG(frame)
    frame = cv2.resize(frame, (width, height))
    frame = Image.fromarray(frame)
    image.paste(frame, (paste_x, 0), frame)

    lines, font_size = text_wrap(text, width - face_w, height - 128, 'assets/Roboto-Regular.ttf')
    font = ImageFont.truetype('assets/Roboto-Regular.ttf', font_size)
    line_height = font.getbbox('hg')[3] - font.getbbox('hg')[1] + 16 
    y_text = (height - (line_height * len(lines))) / 2
    for line in lines:
        line_width = font.getbbox(line)[2] - font.getbbox(line)[0]
        x_text = (face_w if paste_x < 0 else 32) + (width - face_w - line_width) / 2
        d.rounded_rectangle([x_text - 16, y_text - 8, x_text + line_width, y_text + line_height + 8], outline=color["fg"], fill=color["fg"], radius=8)
        y_text += line_height

    y_text = (height - (line_height * len(lines))) / 2
    for line in lines:
        line_width = font.getbbox(line)[2] - font.getbbox(line)[0]
        x_text = (face_w if paste_x < 0 else 32) + (width - face_w - line_width) / 2
        d.text((x_text, y_text), line, fill=color["text"], font=font)
        y_text += line_height

    image.save(thumbnail_filename)
    print(f'Thumbnail saved to {thumbnail_filename}')
    return thumbnail_filename
