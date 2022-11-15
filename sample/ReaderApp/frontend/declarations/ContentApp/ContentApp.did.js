export const idlFactory = ({ IDL }) => {
  const CreateChannelResult = IDL.Variant({
    'created' : IDL.Principal,
    'idAlreadyRegistered' : IDL.Principal,
  });
  const ChannelInfo = IDL.Record({
    'tags' : IDL.Vec(IDL.Text),
    'instance' : IDL.Principal,
  });
  const GetChannelInfoResult = IDL.Variant({
    'ok' : ChannelInfo,
    'notFound' : IDL.Null,
  });
  const RegistrationResult = IDL.Variant({
    'ok' : IDL.Null,
    'idAlreadyRegistered' : IDL.Null,
  });
  return IDL.Service({
    'createChannel' : IDL.Func([IDL.Text], [CreateChannelResult], []),
    'getChannelInfo' : IDL.Func([IDL.Text], [GetChannelInfoResult], []),
    'register' : IDL.Func([IDL.Text, IDL.Principal], [RegistrationResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
