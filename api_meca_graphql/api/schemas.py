import graphene
from api.querys import UserQuery, IncubatorDeviceQuery, IncubatorSettingQuery
from api.mutations import CreateIncubatorDevice, CreateUser, CreateIncubatorSetting, UpdateIncubatorSetting, UpdateIncubatorDevice, DeleteIncubatorSetting, DeleteUser, UpdateUser, ObtainJSONWebToken, DeleteIncubatorDevice
import graphql_jwt
from api.types import UserType

class Query(UserQuery,IncubatorSettingQuery, IncubatorDeviceQuery, graphene.ObjectType ):
    pass

class Mutation(graphene.ObjectType):
    create_incubator_device = CreateIncubatorDevice.Field()
    update_incubator_device = UpdateIncubatorDevice.Field()
    delete_incubator_device = DeleteIncubatorDevice.Field()

    create_user = CreateUser.Field()
    delete_user = DeleteUser.Field()
    update_user = UpdateUser.Field()
    
    create_incubator_setting = CreateIncubatorSetting.Field()
    update_incubator_setting = UpdateIncubatorSetting.Field()
    delete_incubator_setting = DeleteIncubatorSetting.Field()
    
    token_auth = ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)


