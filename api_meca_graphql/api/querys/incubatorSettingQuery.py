import graphene
from api.types import IncubatorSettingType
from api.models import IncubatorSetting


class IncubatorSettingQuery(graphene.ObjectType):
    all_incubator_settings = graphene.List(IncubatorSettingType)
    incubator_setting = graphene.Field(IncubatorSettingType, id=graphene.Int())
    user_incubator_settings = graphene.List(IncubatorSettingType, user_id=graphene.Int())

    def resolve_all_incubator_settings(self, info):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")
        return IncubatorSetting.objects.all()

    def resolve_incubator_setting(self, info, id):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")
        try:
            return IncubatorSetting.objects.get(pk=id)
        except IncubatorSetting.DoesNotExist:
            return None

    def resolve_user_incubator_settings(self, info, user_id):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authentication credentials were not provided")
        
        return IncubatorSetting.objects.filter(user_id=user_id)
