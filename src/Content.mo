module {
    public type Link = {
        #http : Text;
        #ipfs : Text;
    };

    type ContentBase = {

    };

    public type Content = {
        #article : {};
        #image : {};
        #video : {};
        #podcast : {};
        #text : {
            #raw : Text;
            #html : Text;
        };
    };
};
