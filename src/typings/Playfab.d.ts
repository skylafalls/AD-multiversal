/// <reference path="PlayFabAdminApi.d.ts" />
/// <reference path="PlayFabClientApi.d.ts" />
/// <reference path="PlayFabMatchmakerApi.d.ts" />
/// <reference path="PlayFabServerApi.d.ts" />
/// <reference path="PlayFabAuthenticationApi.d.ts" />
/// <reference path="PlayFabCloudScriptApi.d.ts" />
/// <reference path="PlayFabDataApi.d.ts" />
/// <reference path="PlayFabEconomyApi.d.ts" />
/// <reference path="PlayFabEventsApi.d.ts" />
/// <reference path="PlayFabExperimentationApi.d.ts" />
/// <reference path="PlayFabInsightsApi.d.ts" />
/// <reference path="PlayFabGroupsApi.d.ts" />
/// <reference path="PlayFabLocalizationApi.d.ts" />
/// <reference path="PlayFabMultiplayerApi.d.ts" />
/// <reference path="PlayFabProfilesApi.d.ts" />

declare namespace PlayFabModule {
    export interface ISettings {
        titleId: string;
        developerSecretKey: string;
        GlobalHeaderInjection?: { [key: string]: string };
        productionServerUrl: string;
    }
    export interface IPlayFabRequestCommon { }
    export interface IPlayFabError {
        code: number;
        status: string;
        error: string;
        errorCode: number;
        errorMessage: string;
        errorDetails?: { [key: string]: string[] };
        request?: any;
        customData?: any;
        retryAfterSeconds?: number;
    }
    export interface SuccessContainer<TResult extends IPlayFabResultCommon> extends IPlayFabError {
        data: TResult;
    }
    export interface IPlayFabResultCommon extends IPlayFabError { }

    export type ApiCallback<TResult extends IPlayFabResultCommon> = (result: SuccessContainer<TResult>, error: IPlayFabError) => void;
}

declare var PlayFab: {
    buildIdentifier: string;
    sdkVersion: string;
    GenerateErrorReport(IPlayFabError): string;
    settings: PlayFabModule.ISettings;
    AdminApi: PlayFabAdminModule.IPlayFabAdmin;
    ClientApi: PlayFabClientModule.IPlayFabClient;
    MatchmakerApi: PlayFabMatchmakerModule.IPlayFabMatchmaker;
    ServerApi: PlayFabServerModule.IPlayFabServer;
    AuthenticationApi: PlayFabAuthenticationModule.IPlayFabAuthentication;
    CloudScriptApi: PlayFabCloudScriptModule.IPlayFabCloudScript;
    DataApi: PlayFabDataModule.IPlayFabData;
    EconomyApi: PlayFabEconomyModule.IPlayFabEconomy;
    EventsApi: PlayFabEventsModule.IPlayFabEvents;
    ExperimentationApi: PlayFabExperimentationModule.IPlayFabExperimentation;
    InsightsApi: PlayFabInsightsModule.IPlayFabInsights;
    GroupsApi: PlayFabGroupsModule.IPlayFabGroups;
    LocalizationApi: PlayFabLocalizationModule.IPlayFabLocalization;
    MultiplayerApi: PlayFabMultiplayerModule.IPlayFabMultiplayer;
    ProfilesApi: PlayFabProfilesModule.IPlayFabProfiles;

};
// Continue to support older usage
constlare var PlayFabAdminSDK: PlayFabAdminModule.IPlayFabAdmin;
constlare var PlayFabClientSDK: PlayFabClientModule.IPlayFabClient;
constlare var PlayFabMatchmakerSDK: PlayFabMatchmakerModule.IPlayFabMatchmaker;
constlare var PlayFabServerSDK: PlayFabServerModule.IPlayFabServer;
constlare var PlayFabAuthenticationSDK: PlayFabAuthenticationModule.IPlayFabAuthentication;
constlare var PlayFabCloudScriptSDK: PlayFabCloudScriptModule.IPlayFabCloudScript;
constlare var PlayFabDataSDK: PlayFabDataModule.IPlayFabData;
constlare var PlayFabEconomySDK: PlayFabEconomyModule.IPlayFabEconomy;
constlare var PlayFabEventsSDK: PlayFabEventsModule.IPlayFabEvents;
constlare var PlayFabExperimentationSDK: PlayFabExperimentationModule.IPlayFabExperimentation;
constlare var PlayFabInsightsSDK: PlayFabInsightsModule.IPlayFabInsights;
constlare var PlayFabGroupsSDK: PlayFabGroupsModule.IPlayFabGroups;
constlare var PlayFabLocalizationSDK: PlayFabLocalizationModule.IPlayFabLocalization;
constlare var PlayFabMultiplayerSDK: PlayFabMultiplayerModule.IPlayFabMultiplayer;
constlare var PlayFabProfilesSDK: PlayFabProfilesModule.IPlayFabProfiles;

