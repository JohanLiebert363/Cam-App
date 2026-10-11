import os
import cv2
import requests
from flask import Flask, Response, request, abort

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"]

app = Flask(__name__)


def get_rtsp_url(cam_id, token):
    # Uses the user's own token, so Supabase RLS decides if they own the camera
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/cameras",
        params={"id": f"eq.{cam_id}", "select": "rtsp_url"},
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {token}"},
        timeout=5,
    )
    if r.status_code != 200 or not r.json():
        return None
    return r.json()[0]["rtsp_url"]


def frames(url):
    cap = cv2.VideoCapture(url)
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            ok, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            if not ok:
                continue
            yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n"
                   + buf.tobytes() + b"\r\n")
    finally:
        cap.release()


@app.route("/stream/<cam_id>")
def stream(cam_id):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        abort(401)
    url = get_rtsp_url(cam_id, auth[7:])
    if not url:
        abort(404)
    return Response(frames(url),
                    mimetype="multipart/x-mixed-replace; boundary=frame")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, threaded=True)