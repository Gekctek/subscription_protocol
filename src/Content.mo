import Time "mo:base/Time";
module {
    public type Link = {
        #http : Text;
        #ipfs : Text;
    };

    public type Author = {
        #name : Text;
        #identity : Principal;
        #handle : Text;
    };

    public type Image = {
        #link : Link;
        #file : {
            format : Text;
            data : Blob;
        };
    };

    public type Content = {
        title : Text;
        description : Text;
        link : Text;
        authors : [Author];
        image : ?Image;
        language : ?Text;
        date : Time.Time;
    };
};
