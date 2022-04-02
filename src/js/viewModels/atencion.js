
define(["require", "exports", "knockout", "ojs/ojbootstrap", "ojs/ojarraydataprovider","jquery", "ojs/ojtable", "ojs/ojbutton", "ojs/ojpopup", "ojs/ojformlayout",
"ojs/ojinputtext", "ojs/ojinputnumber", "ojs/ojselectsingle", "ojs/ojformlayout"],
function (require, exports, ko, Bootstrap, ArrayDataProvider,$) {
  function ViewModel() {
    var self = this;

    this.connected = () => {
      document.title = "Atencion";
      self.opcion = ko.observable("crear");
      //INPUTS REGISTRO NUEVO: 

      self.idAtencion = ko.observable(0);
      self.atencionA = ko.observable("");
      self.atendidoPor = ko.observable("");
      self.asunto = ko.observable("");
      self.tipo_atencion = ko.observable("");
      self.tipo_usuario = ko.observable("");
      self.estatus = ko.observable("");
      self.observaciones = ko.observable("");

      //Declaracion DataProviders y data

      self.atencion = ko.observableArray([]);
      self.data = ko.observableArray([]);
      self.data.push({ id: "1", atencionA: "Juan meza (20C93018)", atendidoPor: "Alexis B (1983)", asunto: "Problemas plataforma Alumnos", tipo_atencion: "Telefónica", tipo_usuario: "Alumno", estatus: "Finalizado", observaciones: "Ninguna", fecha_atencion:"1-abril-2022" });
      self.data.push({ id: "2", atencionA: "carlos (1234)", atendidoPor: "Alexis B (1983)", asunto: "Problemas con acceso a pagos", tipo_atencion: "Correo Electrónico", tipo_usuario: "Asesor", estatus: "En proceso", observaciones: "Ninguna", fecha_atencion:"1-abril-2022" });
      self.data.push({ id: "3", atencionA: "jorge (4567)", atendidoPor: "Alexis B (1983)", asunto: "Devolución de papeles", tipo_atencion: "Personal", tipo_usuario: "Representante", estatus: "Rechazado", observaciones: "El alumno aun tiene deuda por saldar", fecha_atencion:"1-abril-2022" });

      self.atencion = [
        { value: "Telefónica", label: "Telefónica" },
        { value: "Correo Electrónico", label: "Correo Electrónico" },
        { value: "Personal", label: "Personal" },
      ];
      self.Tipo_usuario = [
        { value: "Alumno", label: "Alumno" },
        { value: "Asesor", label: "Asesor" },
        { value: "Representante", label: "Representante" },
      ];

      self.estatusAtencion = [
        { value: "En proceso", label: "En proceso" },
        { value: "Finalizado", label: "Finalizado" },
        { value: "Rechazado", label: "Rechazado" },
      ];

      self.dataEstatusAtencion = new ArrayDataProvider(this.estatusAtencion, {
        keyAttributes: "value",
      })

      self.dataTipo_usuario = new ArrayDataProvider(this.Tipo_usuario, {
        keyAttributes: "value",
      });

      self.datatipo_atencion = new ArrayDataProvider(this.atencion, {
        keyAttributes: "value",
      });
      self.dataprovider = new ArrayDataProvider(this.data, {
        keyAttributes: "id",
      });

    }; //FIN connected

    
    //MODALES
    self.openCrear = () => {
      let popup = document.getElementById("crear_registro");
      self.opcion("crear");
      popup.open("#btnCrear");
    }

    self.cerrar_modal = () => {
      let popup = document.getElementById("crear_registro");
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
      self.data.push(registro);
      let popup = document.getElementById("crear_registro");
      popup.close();
    }

    self.modalEditar = () => {
      let popup = document.getElementById("crear_registro");
      const element = document.getElementById('table');
      popup.open("#btnCrear");
      const currentRow = element.currentRow;
      const dataUpdate = self.data()[currentRow.rowIndex]
      self.llenarCampos(dataUpdate)
      self.opcion("editar")
      popup.open("#actualizar_btn");
    }

    self.actualizarRegistro = () => {
      console.log("Registro actualizado");
      
      let key = self.idAtencion();
      const newData = {  
        atencionA:self.atencionA(),
        atendidoPor:self.atendidoPor(),
        asunto:self.asunto(),
        tipo_atencion:self.tipo_atencion(),
        tipo_usuario:self.tipo_usuario(),
        estatus:self.estatus(),
        observaciones:self.observaciones()
      }
      console.log(newData);
      this.data.updateItem({ metadata: { key: key }, data: newData });
    }

    self.limpiarCampos = () =>{
      self.atencionA(""),
      self.atendidoPor(""),
      self.asunto(""),
      self.tipo_atencion(""),
      self.tipo_usuario(""),
      self.estatus(""),
      self.observaciones("")
    }

    self.llenarCampos = (dataUpdate) => {
      self.idAtencion(parseInt(dataUpdate.id));
      self.atencionA(dataUpdate.atencionA),
      self.atendidoPor(dataUpdate.atendidoPor),
      self.asunto(dataUpdate.asunto),
      self.tipo_atencion(dataUpdate.tipo_atencion),
      self.tipo_usuario(dataUpdate.tipo_usuario),
      self.estatus(dataUpdate.estatus),
      self.observaciones(dataUpdate.observaciones)


    }

    //FUNCIONES EDITAR REGISTRO DE ATENCION

    //FUNCIONES ELIMINAR REGISTRO DE ATENCION

    //FUNCIONES VISUALIZAR REGISTRO DE ATENCION

    this.removeTask = (event, context) => {
      this.data.splice(context.index, 1);
    };


    this.cancelListener1 = () => {
      let popup = document.getElementById("popup1");
      popup.close();
    }

    this.openListener2 = () => {
      let popup = document.getElementById("popup2");
      popup.open("#btnGo2");
    }

    this.cancelListener2 = () => {
      let popup = document.getElementById("popup2");
      popup.close();
    }


    this.disconnected = () => {

    };


    this.transitionCompleted = () => {

    };

    this.prueba = () => {
      alert("Hola mundo");

    };

  }


  return ViewModel;
}
);
