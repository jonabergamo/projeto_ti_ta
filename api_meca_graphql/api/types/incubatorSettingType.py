import graphene
from graphene_django import DjangoObjectType
from api.models import IncubatorSetting



class IncubatorSettingType(DjangoObjectType):
    
    class Meta:
        model = IncubatorSetting
        fields = '__all__'