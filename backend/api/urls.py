from django.urls import path
from .views import UploadICSView, SessionEventsView
from . import views

urlpatterns = [
    path('upload/', UploadICSView.as_view(), name='upload-ics'),
    path('view/<str:short_id>/', SessionEventsView.as_view(), name='view-events'),
    path("", views.home, name="home")
]
