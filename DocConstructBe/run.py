from app import create_app
from flask_cors import CORS



app = create_app()

app.config['DEBUG'] = True
CORS(app, expose_headers=["Content-Disposition"])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

   