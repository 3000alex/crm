
define(["require", "exports", "knockout", "ojs/ojbootstrap", "ojs/ojarraydataprovider","ojs/ojbufferingdataprovider","jquery", 'ojs/ojmodule-element-utils',"ojs/ojmodule-element", "ojs/ojtable", "ojs/ojbutton", "ojs/ojpopup", "ojs/ojformlayout",
"ojs/ojinputtext", "ojs/ojinputnumber", "ojs/ojselectsingle", "ojs/ojformlayout",],
function (require, exports, ko, Bootstrap, ArrayDataProvider,BufferingDataProvider,$,ModuleElementUtils) {
  function ViewModel(params) {
    var self = this;
    var router = params.parentRouter;
    self.ModuleElementUtils = ModuleElementUtils;
    self.currentDisplayOption = ko.observable();
    self.currentHorizontalGridVisible = ko.observable();
    self.currentVerticalGridVisible = ko.observable();
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

      self.moduleConfig = ko.pureComputed(() =>{
        return {
          view: 'modulos/operaciones',
          viewModel: 'modulos/operaciones'
        }
      });
      //Declaracion data y DataProviders
      self.data = ko.observableArray([]);
      
      $.get({
        url: 'js/data/atencion.json',
 
      }).done(function(data){
       $.each(data, function(index, persona){
          self.data.push(persona);
       })
        console.log(self.data())
      });

      self.dataprovider = new BufferingDataProvider(new ArrayDataProvider(this.data,{
        keyAttributes: 'id'
      }))
      self.currentDisplayOption = ko.observable("grid");
      self.currentHorizontalGridVisible = ko.observable("disable");
      self.currentVerticalGridVisible = ko.observable("enable");

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
      self.data.push(registro);
      self.cerrar_modal_edit_create()
    }

    self.modalEditar = () => {
      let popup = document.getElementById("modal_edit_create");
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
      console.log(newData);
      self.dataprovider.updateItem({ metadata: { key: key }, data: newData });
      self.cerrar_modal_edit_create();
      self.limpiarCampos();
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
    self.visualizarRegistros = () => {
      router.go({ path: 'atencion_detail' });
    }
    
    this.removeTask = (event, context) => {
      console.log(context.index)
      this.data.splice(context.index, 1);
    };


    this.cancelListener1 = () => {
      let popup = document.getElementById("popup1");
      popup.close();
    }

    this.eliminarModal = () => {
      let popup = document.getElementById("popup_eliminar");
      popup.open("#eliminar_btn");
    }

    this.cancelEliminarModal = () => {
      let popup = document.getElementById("popup_eliminar");
      popup.close();
    }


    this.disconnected = () => {

    };


    this.transitionCompleted = () => {

    };

  }


  return ViewModel;
}
);
