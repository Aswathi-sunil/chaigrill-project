from django import forms
from .models import ReservationInquiry

class ReservationForm(forms.ModelForm):
    class Meta:
        model = ReservationInquiry
        fields = ['full_name', 'phone_number', 'outlet', 'booking_time', 'guests_count', 'special_notes']
