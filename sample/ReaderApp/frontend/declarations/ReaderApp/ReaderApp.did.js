export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({
    'created': IDL.Principal,
    'idAlreadyRegistered': IDL.Principal,
  });
  return IDL.Service({ 'createFeed': IDL.Func([IDL.Text], [Result], []) });
};
export const init = ({ IDL }) => { return []; };
