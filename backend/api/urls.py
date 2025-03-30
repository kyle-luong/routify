from django.urls import path
from .views import UploadICSView, SessionEventsView

urlpatterns = [
    path('upload/', UploadICSView.as_view(), name='upload-ics'),
    path('view/<str:short_id>/', SessionEventsView.as_view(), name='view-events'),
]
