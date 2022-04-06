
define(["require", "exports", "knockout", "ojs/ojbootstrap", "ojs/ojarraydataprovider","ojs/ojbufferingdataprovider","jquery", "ojs/ojtable", "ojs/ojbutton", "ojs/ojpopup", "ojs/ojformlayout",
"ojs/ojinputtext", "ojs/ojinputnumber", "ojs/ojselectsingle", "ojs/ojformlayout"],
function (require, exports, ko, Bootstrap, ArrayDataProvider,BufferingDataProvider,$) {
  function ViewModel() {
    var self = this;
    //var router = params.parentRouter;

    this.connected = () => {
      document.title = "Crear incidencia";

      //INPUTS REGISTRO NUEVO: 
      self.atencionA = ko.observable("");
      self.atendidoPor = ko.observable("");
      self.asunto = ko.observable("");
      self.tipo_atencion = ko.observable("");
      self.tipo_usuario = ko.observable("");
      self.estatus = ko.observable("");
      self.observaciones = ko.observable("");

      self.atencion = [
        { value: "Telefónica", label: "Telefónica" },
        { value: "Correo Electrónico", label: "Correo Electrónico" },
        { value: "Personal", label: "Personal" },
      ];
      self.datatipo_atencion = new ArrayDataProvider(this.atencion, {
        keyAttributes: "value",
      });

      self.Tipo_usuario = [
        { value: "Alumno", label: "Alumno" },
        { value: "Asesor", label: "Asesor" },
        { value: "Representante", label: "Representante" },
      ];
      self.dataTipo_usuario = new ArrayDataProvider(this.Tipo_usuario, {
        keyAttributes: "value",
      });

      self.estatusAtencion = [
        { value: "En proceso", label: "En proceso" },
        { value: "Finalizado", label: "Finalizado" },
        { value: "Rechazado", label: "Rechazado" },
      ];
      self.dataEstatusAtencion = new ArrayDataProvider(this.estatusAtencion, {
        keyAttributes: "value",
      })
    }; //FIN connected

    
    //MODALES
    self.openCrear = () => {
      let popup = document.getElementById("modal_edit_create");
      self.opcion("crear");
      popup.open("#btnCrear");
    }

    self.cerrar_modal_edit_create = () => {
      let popup = document.getElementById("modal_edit_create");
      self.limpiarCampos();
      self.opcion("");
      popup.close();
    }

    //FUNCIONES CREAR REGISTRO ATENCION
    self.crearRegistro = () => {
      let registro = {
        id: self.data().length+1,
        atencionA: self.atencionA(),
        atendidoPor: self.atendidoPor(),
        asunto: self.asunto(),
        tipo_atencion: self.tipo_atencion(),
        tipo_usuario: self.tipo_usuario(),
        estatus: self.estatus(),
        observaciones: self.observaciones(),
        fecha_atencion: "1-abril-2022"
      }
    }

    self.actualizarRegistro = () => {
      let key = self.idAtencion();
      const newData = {  
        id:key,
        atencionA:self.atencionA(),
        atendidoPor:self.atendidoPor(),
        asunto:self.asunto(),
        tipo_atencion:self.tipo_atencion(),
        tipo_usuario:self.tipo_usuario(),
        estatus:self.estatus(),
        observaciones:self.observaciones(),
        fecha_atencion: "1-abril-2022"
      }
    }

    this.disconnected = () => {

    };


    this.transitionCompleted = () => {

    };

  }


  return ViewModel;
}
);
