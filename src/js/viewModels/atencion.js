
define(["require", "exports", "knockout","ojs/ojarraydataprovider","ojs/ojbufferingdataprovider","jquery", "text!../data/dataAdministrativos.json", "text!../data/dataAlumnos.json",
"ojs/ojtable", "ojs/ojbutton", "ojs/ojpopup", "ojs/ojformlayout",
"ojs/ojinputtext", "ojs/ojinputnumber", "ojs/ojselectsingle", "ojs/ojformlayout","ojs/ojselectcombobox"],
function (require, exports, ko, ArrayDataProvider,BufferingDataProvider,$,dataADM,dataAlu) {
  function ViewModel() {
    var self = this;
    //var router = params.parentRouter;

    //Variables tabla
    self.currentDisplayOption = ko.observable();
    self.currentHorizontalGridVisible = ko.observable();
    self.currentVerticalGridVisible = ko.observable();

    //Variables Modal crear y editar
    self.suggestionsADM = ko.observableArray([]); //Array opciones Atendido por
    self.suggestionsAlu = ko.observableArray([]); // Array opciones Atencion A

    self.connected = () => {
      document.title = "Atencion";
      self.opcion = ko.observable("crear");

      //Configuracion datos de la tabla
      self.data = ko.observableArray([]);
      self.dataUpdate = ko.observable(
        {
          "id": "",
          "usuarioAtendido": {
                "nombre": "",
                "num_contacto": "",
                "correoInstitucional": "",
                "matricula": "",
                "correoPersonal": "",
                "campus": "",
                "licenciatura": "",
                "tipo_usuario": ""
          },
          "administrativo": {
                "nombre": "",
                "numExpediente": "",
                "correoInstitucional": ""
          },
          "datosGenerales": {
                "estatus": "",
                "tipo_atencion": "",
                "asunto": "",
                "notas": [],
                "fecha_inicio": "",
                "fecha_fin": ""
          }
    }
      );
      self.currentDisplayOption = ko.observable("grid");
      self.currentHorizontalGridVisible = ko.observable("disable");
      self.currentVerticalGridVisible = ko.observable("enable");
      $.get({
        url: 'js/data/atencion.json',
 
      }).done(function(data){
       $.each(data, function(index, persona){
          self.data.push(persona);
       })
        console.log(self.data())
      }).fail((err,err2) => {
        console.log(err,err2)
      });
      self.dataprovider = new BufferingDataProvider(new ArrayDataProvider(this.data,{ keyAttributes: 'id'}));
      //Fin configuracion de los datos de la tabla


      //Configuracion Modal Crear
      //Inicializacion de variables a usar
      self.idAtencion = ko.observable(0);
      self.estudiante = ko.observable("");
      self.matricula = ko.observable("");
      self.administrativo = ko.observable("");
      self.tipo_atencion = ko.observable("");
      self.estatus = ko.observable("");
      self.asunto = ko.observable("");
      self.notas = ko.observableArray([]);
      //FIN Inicializacion de variables a usar
      
      //Configuraciones Atencion A:
      $.each(JSON.parse(dataAlu), (index, data)=>{ self.suggestionsAlu.push({ value: data.matricula, label:data.nombre }) })
      self.dataestudiante = new ArrayDataProvider(this.suggestionsAlu,{ keyAttributes: "value", });
      //Fin config atencion a
      
      //Config atendido por
      $.each(JSON.parse(dataADM), (index, data)=>{ self.suggestionsADM.push({ value: data.numExpediente, label:data.nombre }) })
      self.dataadministrativo = new ArrayDataProvider(this.suggestionsADM,{ keyAttributes: "value", });
      //Fin config atendido por

      //Config Tipo de atencion
      self.datatipo_atencion = new ArrayDataProvider([
        { value: "Telefónica", label: "Telefónica" },
        { value: "Correo Electrónico", label: "Correo Electrónico" },
        { value: "Personal", label: "Personal" }, ],
        { keyAttributes: "value", });
      //Fin config tipo de atencion
      
      //Configuracion Estatus
      self.dataEstatusAtencion = new ArrayDataProvider([
        { value: "En proceso", label: "En proceso" },
        { value: "Finalizado", label: "Finalizado" },
        { value: "Rechazado", label: "Rechazado" }, ],
        { keyAttributes: "value", })
      //Fin configuracion estatus
      
    }; //FIN connected
    
    
    //Funciones de MODALES
    self.openModalCrear = () => {
      let popup = document.getElementById("modal_edit_create");
      self.opcion("crear");
      popup.open("#btnCrear");
    }
    self.modalEditar = () => {
      let popup = document.getElementById("modal_edit_create");
      const element = document.getElementById('table');
      popup.open("#btnCrear");
      const currentRow = element.currentRow;
      console.log(self.data()[currentRow.rowIndex])
      self.dataUpdate(self.data()[currentRow.rowIndex]);

      self.llenarCampos()
      self.opcion("editar")
      popup.open("#actualizar_btn");
    }

    self.closeModalCrear = () => {
      let popup = document.getElementById("modal_edit_create");
      self.limpiarCampos();
      self.opcion("");
      popup.close();
    }

    //FUNCIONES CREAR REGISTRO ATENCION
    self.crearRegistro = () => {
      let registro = {};
      $.each(JSON.parse(dataAlu), (index, data)=>{
        if(data.matricula === self.estudiante() ){
          registro = {
            id: self.data().length+1,
            usuarioAtendido: data,
            administrativo: { //Estos datos se obtendran del login 
              nombre: "alex",
              numExpediente: "1931",
              correoInstituciona: "alex@iedep.edu.mx"
            },
            datosGenerales:{
              estatus: self.estatus(),
              tipo_atencion: self.tipo_atencion(),
              asunto: self.asunto(),
              notas: [self.notas()],
            }
          }

          //Se almacena el nuevo registro en la tabla CRM 

          //Se actualiza la tabla principal con los nuevos datos: 
          self.data.push(registro);
          //Cerramos el modal
          self.closeModalCrear();
        }
      })
    }

    //FUNCIONES ACTUALIZAR REGISTRO
    //Llenamos los inputs del modal con los datos de la tabla
    self.llenarCampos = () => {
      
      self.idAtencion(parseInt(self.dataUpdate().id));
      self.administrativo(self.dataUpdate().administrativo.numExpediente),
      self.tipo_atencion(self.dataUpdate().datosGenerales.tipo_atencion),
      self.estatus(self.dataUpdate().datosGenerales.estatus),
      self.notas("")
    }


    self.actualizarRegistro = () => {
      self.dataUpdate().administrativo.numExpediente = self.administrativo()
      self.dataUpdate().datosGenerales.tipo_atencion= self.tipo_atencion()
      self.dataUpdate().datosGenerales.estatus = self.estatus()
      if(self.notas()!=""){ self.dataUpdate().datosGenerales.notas.push(self.notas()) }
      self.dataprovider.updateItem({ metadata: { key: self.dataUpdate().id }, data: self.dataUpdate() });
      self.closeModalCrear();
      self.limpiarCampos();
    }

    self.limpiarCampos = () =>{
      self.estudiante(""),
      self.administrativo(""),
      self.asunto(""),
      self.tipo_atencion(""),
      self.estatus(""),
      self.notas("")
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
