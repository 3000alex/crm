
define(["require", "exports", "knockout","ojs/ojarraydataprovider","ojs/ojbufferingdataprovider","ojs/ojkeyset","jquery",'ojs/ojpagingdataproviderview', "text!../data/dataAdministrativos.json", "text!../data/dataAlumnos.json",
"ojs/ojtable", "ojs/ojbutton", "ojs/ojpopup", "ojs/ojformlayout","ojs/ojaccordion", "ojs/ojradioset", "ojs/ojlabel",
"ojs/ojinputtext", "ojs/ojinputnumber", "ojs/ojselectsingle", "ojs/ojformlayout","ojs/ojselectcombobox",'ojs/ojinputsearch'],
function (require, exports, ko, ArrayDataProvider,BufferingDataProvider,ojkeyset_1,$,PagingDataProviderView,dataADM,dataAlu) {
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
      self.pagingDataProvider = new PagingDataProviderView(new ArrayDataProvider(this.data,{ idAttribute: 'id' }));
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
      self.incidenciaDetail = ko.observable({});
      self.search = ko.observable('');
      self.rawSearch = ko.observable('');
      this.searchRegister = function (event) {
        var detail = event.detail;
        if(detail.value){

        }
        else{
          alert("Debe ingresar un dato valido")
        }
        detail.value ?  alert(detail.value) : alert("Debe ingresar un dato valido")
      }
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


    self.abrirModal = (event) => {
      let idBtnModal = event.target.id
      let popup;

      if(idBtnModal === "btnCrear"){
        self.opcion("crear");
        popup = document.getElementById("modal_edit_create");
      }
      else if(idBtnModal === "btnActualizar"){
        self.opcion("editar")
        popup = document.getElementById("modal_edit_create");
        const element = document.getElementById('table');
        const currentRow = element.currentRow;
        self.dataUpdate(self.data()[currentRow.rowIndex]);
        self.llenarCampos()
      }
      else if(idBtnModal === "btnEliminar"){
        popup = document.getElementById("popup_eliminar");
      }
      else if(idBtnModal === "btnMostrar"){
        popup = document.getElementById("popup_mostrar");
        const element = document.getElementById('table');
        const currentRow = element.currentRow;
        const dataObj = element.getDataForVisibleRow(currentRow.rowIndex);
        self.incidenciaDetail(dataObj.data);
      }

      popup.open(idBtnModal);
    }

    self.cerrarModal = (event) => {
      console.log(event)
      let idBtnModal = event.target.id
      console.log(event)
      let popup;
      if(idBtnModal === "btnCancelCrearEditar1" || idBtnModal === "btnCancelCrearEditar2"){
        popup = document.getElementById("modal_edit_create");
      }
      else if(idBtnModal === "btnCancelEliminar1" || idBtnModal === "btnCancelEliminar2"){
        popup = document.getElementById("popup_eliminar");
      }
      else if(idBtnModal === "btnCancelMostrar1" || idBtnModal === "btnCancelMostrar2"){ 
        popup = document.getElementById("popup_mostrar");
      }

      self.limpiarCampos();
      popup.close();
    }

    self.cancelEliminarModal = () => {
      let popup = document.getElementById("popup_eliminar");
      popup.close();
    }
    self.cancelMostrarModal = () => {
      let popup = document.getElementById("popup_mostrar");
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
              nombre: "alex3",
              numExpediente: "1960",
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
          self.cerrarModal();
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
      self.cerrarModal();
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

    //FUNCIONES ELIMINAR REGISTRO DE ATENCION




    self.eliminarRegistro = () => {
      const element = document.getElementById('table');
      const currentRow = element.currentRow;
      const dataObj = element.getDataForVisibleRow(currentRow.rowIndex);
      self.dataprovider.removeItem({
        metadata: { key: dataObj.key },
        data:dataObj.data
      });
      this.dataprovider.getTotalSize().then(function (value) {
        if (value == 0) {
            this.isEmptyTable(true);
        }
    }.bind(this));

    // Clear the table selection
    element.selected = { row: new ojkeyset_1.KeySetImpl(), column: new ojkeyset_1.KeySetImpl() };
    };
    //FUNCIONES VISUALIZAR REGISTRO DE ATENCION


    self.visualizarRegistros = () => {
      
    }

    //Filter table 

    
    this.disconnected = () => {

    };

    this.transitionCompleted = () => {

    };

  }


  return ViewModel;
}
);
