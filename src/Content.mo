import Time "mo:base/Time";
module {
    public type Author = {
        #name : Text;
        #identity : Principal;
        #handle : Text;
    };

    public type Content = {
        title : Text;
        body : {
            format : ?Text;
            value : Text;
        };
        link : Text;
        authors : [Author];
        imageLink : ?Text;
        language : ?Text;
        date : Time.Time;
    };
};
