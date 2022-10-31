module {
    public type Url = Text;

    public type Content = {
        #link : {
            linkType : {
                // TODO is this needed if you can inspect the link? redundant?
                #file : {
                    #image;
                    #video;
                    #other;
                };
                #page;
            };
            url : Url;
        };
        #text : {
            #raw : Text;
            #html : Text;
            #markdown : Text;
        };
    };
};
