export const idlFactory = ({ IDL }) => {
  const ChannelInfo = IDL.Record({
    'tags' : IDL.Vec(IDL.Text),
    'instance' : IDL.Principal,
  });
  const GetChannelInfoResult = IDL.Variant({
    'ok' : ChannelInfo,
    'notFound' : IDL.Null,
  });
  const AppInfo = IDL.Record({
    'publicKey' : IDL.Vec(IDL.Nat8),
    'name' : IDL.Text,
  });
  const App = IDL.Record({
    'signature' : IDL.Vec(IDL.Nat8),
    'publicKey' : IDL.Vec(IDL.Nat8),
    'getChannelInfo' : IDL.Func([IDL.Text], [GetChannelInfoResult], []),
  });
  const RegistrationResult = IDL.Variant({
    'ok' : IDL.Null,
    'idAlreadyRegistered' : IDL.Null,
  });
  return IDL.Service({
    'getChannelInfo' : IDL.Func(
        [IDL.Text, IDL.Text],
        [GetChannelInfoResult],
        [],
      ),
    'getRegisteredApps' : IDL.Func([], [IDL.Vec(AppInfo)], ['query']),
    'register' : IDL.Func([IDL.Text, App], [RegistrationResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
