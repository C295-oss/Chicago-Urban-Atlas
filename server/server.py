from flask import Flask


app = Flask(__name__)


@app.route('/')
def defualt():
    return "<h1>DEFAULT DEVELOPMENT SERVER.</h1>"


if __name__ == "__main__":
    app.run(debug=True)
