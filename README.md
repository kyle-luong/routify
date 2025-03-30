# routify
Upload your university schedule and visualize your classes across the week with Routify! As previous first-years ourselves, we know the feeling of confusion when trying to navigate a new and large campus all too well. More importantly, just because your schedule works online, they may not work location-wise. Routify helps students see the time and distance relationships between their classes to plan their schedule accordingly.

## How to Run
1. Clone the repository
2. ```cd backend```
3. ```python3 -m venv env``` to make a python virtual environment
4. ```source env/bin/activate``` to run the virtual environment
5. ```pip install -r requirements.txt``` to install all required backend packages
6. Within the backend directory, create a .env file for ```HASHID_SALT``` and ```GOOGLE_MAP_TOKEN```
7. ```cd ../frontend```
8. ```npm install```
9. Within the frontend directory, create a .env file for ```REACT_APP_API_BASE_URL=http://localhost:8000``` and ```REACT_APP_MAPBOX_TOKEN```, which requires a mapbox public api token
10. Open two separate terminals
11. Change one terminal into the backend directory (make sure you are in your virtual envirroment, if not then refer to instruction 4)
12. In this terminal, run ```python manage.py makemigrations api```
13. ```python manage.py migrate```
14. ```python manage.py runserver``` to start the Django server
15. In the other terminal, change into the frontend directory
16. ```npm start``` to start the React project
17. Visit the localhost link generated to view the complete project!

Thank you for sticking with our instructions! We hope you enjoy Routify.
