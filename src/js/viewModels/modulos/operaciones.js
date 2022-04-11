define([],
 function() {
    function ViewModel() {

      this.connected = () => {
        document.title = "Dashboard";

      };


      this.disconnected = () => {

      };


      this.transitionCompleted = () => {
        
      };
    }


    return ViewModel;
  }
);
