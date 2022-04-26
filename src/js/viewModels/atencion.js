
define(["require", "exports", "knockout", "ojs/ojarraydataprovider", "ojs/ojbufferingdataprovider", "ojs/ojkeyset", "jquery","ojs/ojpagingdataproviderview",
  "ojs/ojtable", "ojs/ojbutton", "ojs/ojpopup", "ojs/ojformlayout", "ojs/ojaccordion", "ojs/ojradioset", "ojs/ojlabel", "ojs/ojlabelvalue",'ojs/ojpagingcontrol',
  "ojs/ojinputtext", "ojs/ojfilepicker", "ojs/ojinputnumber", "ojs/ojselectsingle", "ojs/ojformlayout", "ojs/ojselectcombobox", 'ojs/ojinputsearch'],
  function (require, exports, ko, ArrayDataProvider, BufferingDataProvider, ojkeyset_1, $,PagingDataProviderView,) {
    function ViewModel() {
      var self = this;
      self.data = ko.observableArray([]); //Data de la tabla principal
      self.dataADM = ko.observableArray([]); //Data de los administradores que estan en el sistema
      self.dataAlu = ko.observableArray([]); //Data de los alumnos a quien pueden asociarse las incidencias
      self.suggestionsADM = ko.observableArray([]); //Array opciones Atendido por
      self.fecha = "";
      self.hora = "";

      self.obtenerDatos = () => {
        let peticion = $.get({ url: 'js/data/atencion.json' })
        peticion.done((data) => { 
          self.data(data) 
          
        })
        peticion.fail((err, err2) => { console.log(err, err2) });

        peticion = $.get({ url: 'js/data/dataAdministrativos.json' })
        peticion.done((data) => {
          self.dataADM(data)
          $.each(self.dataADM(), (index, data) => { self.suggestionsADM.push({ value: data.numExpediente, label: data.nombre }) }) //Config atendido por
        })
        peticion.fail((err, err2) => { console.log(err, err2) });

        //Configuramos suggestions 
        self.dataadministrativo = new ArrayDataProvider(this.suggestionsADM, { keyAttributes: "value", });
      }

      self.connected = () => {
        document.title = "Atencion";
        self.opcion = ko.observable("crear");

        //Obtenemos datos
        self.obtenerDatos();

        //Configuracion datos de la tabla
        self.currentDisplayOption = ko.observable("grid");
        self.currentHorizontalGridVisible = ko.observable("disable");
        self.currentVerticalGridVisible = ko.observable("enable");
        self.dataprovider = new BufferingDataProvider(new ArrayDataProvider(this.data, { keyAttributes: 'id' })); //Buffering para actualizar la tabla
        this.pagingDataProvider = new PagingDataProviderView(new ArrayDataProvider(this.data, { idAttribute: 'id' }));

        console.log(self.data())
        console.log(this.pagingDataProvider)
        //Fin configuracion de los datos de la tabla

        //Variables para actualizar tabla
        self.dataUpdate = {}
        //Fin variables para actualizar tabla

        //Configuracion Modal Crear
        //Inicializacion de variables a usar
        self.idAtencion = ko.observable(0);
        self.tipoUsuario = ko.observable("");
        self.identificadorPersonaAtendida = ko.observable("");
        self.administrativo = ko.observable("");
        self.tipoAtencion = ko.observable("");
        self.estatus = ko.observable("");
        self.asunto = ko.observable("");
        self.seguimiento = ko.observableArray([]);
        self.camposSeguimientos = ko.observable(false)

        //Variables Incidencia Detail
        self.idIncidencia = ko.observable();
        self.incidenciaDetail = ko.observable({
          personaAtendida: ko.observable({
            nombre: ko.observable(),
            numContacto: ko.observable(),
            correoInstitucional: ko.observable(),
            correoInstitucional: ko.observable(),
            matricula: ko.observable(),
            correoPersonal: ko.observable(),
            campus: ko.observable(),
            licenciatura: ko.observable(),
          }),
          administrativo: ko.observable({
            nombre: ko.observable(),
            numExpediente: ko.observable(),
            correoInstitucional: ko.observable(),
          }),
          datosGenerales: ko.observable({
            fechaInicio: ko.observable(),
            estatus: ko.observable(),
            tipoAtencion: ko.observable(),
            asunto: ko.observable(),
            seguimiento: ko.observableArray([]),
            fecha_fin: ko.observable(),
          }),

        })
        //Fin variables Incidencia Detail 

        //Variables campos de busqueda 
        self.search = ko.observable('');
        self.rawSearch = ko.observable('');

        //Variables seguimiento:
        self.seguimientoUpdate = ko.observable({});
        self.camposSeguimiento = ko.observable(true);
        self.seguimientoArray = ko.observableArray([]);

        //Variables y funciones FILE
        self.files = ko.observable([]);
        self.fileNames = ko.observable([]);
        primaryTextFilePicker = ko.observable("Adjunta archivos arrastrándolos y colocándolos aquí, seleccionándolos o pegándolos.")
        secondarytextFilePicker = ko.observable("Tipo de datos aceptados:JPG,JPEG,PDF,XLSX,DOCX")
        self.invalidMessage = ko.observable("")
        self.invalidListener = (event) => {
          alert("Archivo(s) invalido(s), por favor intente nuevamente")
          this.fileNames([]);
        };
        self.acceptStr = ko.observable("image/jpg,image/jpeg,application/pdf,application/docx,application/xlsx"); //Tipo de datos aceptados
        self.acceptArr = ko.pureComputed(() => {
          const accept = self.acceptStr();
          return accept ? accept.split(",") : [];
        });

        self.selectListener = (event) => {

          self.invalidMessage("");
          self.files(event.detail.files);
          self.fileNames(Array.prototype.map.call(self.files(), (file) => {
            return file.name;
          }));
        };
        //FIN Inicializacion de variables a usar

        //Config Tipo de atención
        self.datatipo_atencion = new ArrayDataProvider([
          { value: "Telefónica", label: "Telefónica" },
          { value: "Correo Electrónico", label: "Correo Electrónico" },
          { value: "Personal", label: "Personal" }],
          { keyAttributes: "value", });
        //Fin config tipo de atencion

        //Configuracion Estatus
        self.dataEstatusAtencion = new ArrayDataProvider([
          { value: "Se necesitan más datos", label: "Se necesitan más datos" },
          { value: "Rechazado", label: "Rechazado" },
          { value: "En proceso", label: "En proceso" },
          { value: "Finalizado", label: "Finalizado" }],
          { keyAttributes: "value", })
        //Fin configuracion estatus

        //Configuracion persona atendida
        self.dataPersonaAtendida = new ArrayDataProvider([
          { value: "Aspirante", label: "Aspirante" },
          { value: "Alumno", label: "Alumno" },
          { value: "Ex Alumno", label: "Ex Alumno" },
          { value: "Representante", label: "Representante" },
          { value: "Coordinador(a)", label: "Coordinador(a)" },
        ], { keyAttributes: "value", })
        //Fin configuracion persona atendida 

      }; //FIN connected

      //Funciones de MODALES

      self.abrirModal = (event) => {
        let idBtnModal = event.target.id

        if (idBtnModal === "btnCrear") {
          document.getElementById("crearModal").open();
        }
        else if (idBtnModal === "btnActualizar") {
          document.getElementById("modal_edit_create");
          const element = document.getElementById('table');
          const currentRow = element.currentRow;
          self.dataUpdate = self.data()[currentRow.rowIndex];
          self.idIncidencia(self.dataUpdate.id)
          self.asunto(self.dataUpdate.datosGenerales.asunto)
          self.tipoUsuario(self.dataUpdate.personaAtendida.tipoUsuario)
          self.seguimientoArray(self.dataUpdate.datosGenerales.seguimiento);
          document.querySelector("#editarModal").open();
        }

        else if (idBtnModal === "btnEliminar") {
          document.querySelector("#eliminarModal").open();
        }

        else if (idBtnModal === "btnMostrar") {
          const element = document.getElementById('table');
          const currentRow = element.currentRow;
          const dataObj = element.getDataForVisibleRow(currentRow.rowIndex);

          self.idIncidencia(dataObj.data.id);
          self.incidenciaDetail().personaAtendida(dataObj.data.personaAtendida);
          self.incidenciaDetail().administrativo(dataObj.data.administrativo)
          self.incidenciaDetail().datosGenerales(dataObj.data.datosGenerales)
          document.getElementById("mostrarModal").open();
        }
      }

      self.cerrarModal = (event) => {
        let idBtnModal = event.target.id

        if (idBtnModal === "btnCancelCrear1" || idBtnModal === "btnCancelCrear2") {
          document.querySelector("#crearModal").close();
        }
        else if (idBtnModal === "btnCancelEditar1" || idBtnModal === "btnCancelEditar2") {
          document.querySelector("#editarModal").close();
          self.camposSeguimientos(false)
        }
        else if (idBtnModal === "btnCancelEliminar1" || idBtnModal === "btnCancelEliminar2") {
          document.querySelector("#eliminarModal").close();
        }
        else if (idBtnModal === "btnCancelMostrar1" || idBtnModal === "btnCancelMostrar2") {
          document.querySelector("#mostrarModal").close();
        }

        self.limpiarCampos();
      }

      //FUNCIONES CREAR REGISTRO ATENCION
      self.crearRegistro = () => {
        let registro = {};
        let dataPersonaAtendidaBD;
        let dataAdmBD;
        let seguimientoBD;

        //Configuramos fecha: 
        self.obtenerFecha();
        //Fin configuracion fecha. 

        //Buscamos los datos de la persona atendida: 
        // *** En produccion se tendra que hacer una busqueda a la base de datos. ***
        if (self.tipoUsuario() == "Aspirante") {
          dataPersonaAtendidaBD = {
            id: "19231",
            numExpediente: "",
            nombre: "Juan meza",
            numContacto: "222312345",
            correoInstitucional: "ejemplo@iedep.edu.mx",
            matricula: "",
            correoPersonal: "personal@iedep.edu.mx",
            campus: "NOPALUCAN",
            licenciatura: "LICENCIATURA EN PEDAGOGIA",
            tipoUsuario: self.tipoUsuario()
          }
        }
        else if (self.tipoUsuario() == "Alumno" || self.tipoUsuario() == "Ex Alumno") {
          dataPersonaAtendidaBD = {
            id: "",
            numExpediente: "",
            nombre: "Juan meza",
            numContacto: "222312345",
            correoInstitucional: "ejemplo@iedep.edu.mx",
            matricula: "20C31234",
            correoPersonal: "personal@iedep.edu.mx",
            campus: "NOPALUCAN",
            licenciatura: "LICENCIATURA EN PEDAGOGIA",
            tipoUsuario: self.tipoUsuario()
          }
        }
        else if (self.tipoUsuario() == "Representante" || self.tipoUsuario() == "Coordinador(a)") {
          dataPersonaAtendidaBD = {
            id: "",
            numExpediente: "1254",
            nombre: "Juan meza",
            numContacto: "222312345",
            correoInstitucional: "ejemplo@iedep.edu.mx",
            matricula: "",
            correoPersonal: "personal@iedep.edu.mx",
            campus: "NOPALUCAN",
            licenciatura: "LICENCIATURA EN PEDAGOGIA",
            tipoUsuario: self.tipoUsuario()
          }
        }

        //Obtenemos datos del administrativo que atendio la incidencia
        dataAdmBD = { //Estos datos se obtendran del login 
          nombre: "alex3",
          numExpediente: "1960",
          correoInstituciona: "alex@iedep.edu.mx"
        }
        //Creamos seguimiento para esta incidencia en la BD
        let idSeguimiento = "3"; //Este ID lo obtenemos de la BD al crear el registro
        seguimientoBD = {
          "id": idSeguimiento,
          "descripcion": self.seguimiento(),
          "tipoAtencion": self.tipoAtencion(),
          "tipoActualizacion": "Registro creado",
          "administrativo": dataAdmBD.nombre,
          "estatus": self.estatus(),
          "archivos": self.files(),
          "fecha_actualizacion": self.fecha + "  " + self.hora
        }

        registro = {
          id: self.data().length + 1, //Este dato sera generado cuando se cree el registro
          personaAtendida: dataPersonaAtendidaBD,
          administrativo: dataAdmBD,
          datosGenerales: {
            estatus: self.estatus(),
            tipoAtencion: self.tipoAtencion(),
            asunto: self.asunto(),
            seguimiento: [seguimientoBD],
            fecha_inicio: self.fecha + "  " + self.hora,
            fecha_fin: ""
          }
        }

        console.log(registro)
        //Se almacena el nuevo registro en la tabla CRM 

        //Se actualiza la tabla principal con los nuevos datos: 
        self.data.push(registro);
        //Cerramos el modal
        document.querySelector("#crearModal").close();
      }

      //FUNCIONES ACTUALIZAR REGISTRO
      //Llenamos los inputs del modal con los datos de la tabla
      self.llenarCampos = () => {
        self.idAtencion(parseInt(self.dataUpdate.id));
        self.administrativo(self.dataUpdate.administrativo.numExpediente),
          self.tipoAtencion(self.dataUpdate.datosGenerales.tipoAtencion),
          self.estatus(self.dataUpdate.datosGenerales.estatus),
          self.seguimientoArray(self.dataUpdate.datosGenerales.seguimiento);
        self.seguimiento("")
      }

      self.obtenerFecha = () => {
        let date = new Date()
        self.fecha = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        self.hora = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      }

      self.actualizarRegistro = () => {
        self.obtenerFecha();
        self.dataUpdate.administrativo.numExpediente = self.administrativo()
        self.dataUpdate.datosGenerales.tipoAtencion = self.tipoAtencion()
        self.dataUpdate.datosGenerales.estatus = self.estatus()
        if (self.seguimiento() != "") {
          let idSeguimiento = "3"; //Este ID lo obtenemos de la BD al crear el registro
          self.dataUpdate.datosGenerales.seguimiento.push(
            {
              "id": idSeguimiento,
              "descripcion": self.seguimiento(),
              "tipoAtencion": self.tipoAtencion(),
              "tipoActualizacion": "Actualización de status",
              "administrativo": dataAdmBD.nombre,
              "estatus": self.estatus(),
              "archivos": self.files(),
              "fecha_actualizacion": self.fecha + "  " + self.hora
            }
          )
        }
        self.dataprovider.updateItem({ metadata: { key: self.dataUpdate.id }, data: self.dataUpdate });
        self.limpiarCampos();

        //Cerramos el modal
        document.getElementById("editarModal").close();

      }

      self.activarCamposSeguimientos = (event) => {
        $(event.target).prop('disabled', true);
        self.camposSeguimientos(true)
      }

      self.actualizarSeguimientos = () => {
        self.obtenerFecha();
        //Obtenemos datos del administrativo
        let dataAdmBD = { //Estos datos se obtendran del login 
          nombre: "alex3",
          numExpediente: "1960",
          correoInstituciona: "alex@iedep.edu.mx"
        }
        let idSeguimiento = "3"; //Este ID lo obtenemos de la BD al crear el registro
        self.seguimientoArray.push(
          {
            "id": idSeguimiento,
            "descripcion": self.seguimiento(),
            "tipoAtencion": self.tipoAtencion(),
            "tipoActualizacion": "Se agrego una nota nueva",
            "administrativo": dataAdmBD.nombre,
            "estatus": self.estatus(),
            "archivos": self.files(),
            "fecha_actualizacion": self.fecha + "  " + self.hora
          }
        )
        self.limpiarCampos();
        $("#agregarSeguimientoBtn").prop("disabled", false);
        self.camposSeguimientos(false);
      }

      self.activarCamposSeguimiento = (event) => {
        self.camposSeguimiento() == true ? self.camposSeguimiento(false) : self.camposSeguimiento(true);
      }

      self.actualizarCamposSeguimiento = (event) => {
        let idSeguimiento = event.target.id;
        let seguimiento = self.dataUpdate.datosGenerales.seguimiento;
        self.seguimientoUpdate(seguimiento[idSeguimiento - 1]);//Quitar -1 cuando sea la informacion de la BD
      }

      self.eliminarSeguimiento = (event) => {
        alert("seguimiento eliminado")
      }

      self.cancelActualizarSeguimientos = () => {
        $("#agregarSeguimientoBtn").show();
        self.camposSeguimientos(false);
        self.seguimiento("")
        self.files("")
      }

      self.limpiarCampos = () => {
        self.administrativo("");
        self.asunto("");
        self.tipoAtencion("");
        self.estatus("");
        self.seguimiento("");
        self.identificadorPersonaAtendida("");
        self.fileNames("");
        self.files = ko.observable([]);

      }

      //FUNCIONES ELIMINAR REGISTRO DE ATENCION
      self.eliminarRegistro = () => {
        const element = document.getElementById('table');
        const currentRow = element.currentRow;
        const dataObj = element.getDataForVisibleRow(currentRow.rowIndex);
        self.dataprovider.removeItem({
          metadata: { key: dataObj.key },
          data: dataObj.data
        });
        this.dataprovider.getTotalSize().then(function (value) {
          if (value == 0) {
            this.isEmptyTable(true);
          }
        }.bind(this));

        // Clear the table selection
        element.selected = { row: new ojkeyset_1.KeySetImpl(), column: new ojkeyset_1.KeySetImpl() };
        //Cerramos el modal

        document.getElementById("eliminarModal").close();

      };
      //FUNCIONES VISUALIZAR REGISTRO DE ATENCION

      self.visualizarRegistros = () => {
      }

      //FUNCIONES BUSCAR REGISTRO 
      this.searchRegister = function (event) {
        let queryId = event.detail.value;
        let objData = "";
        //Aqui se debe de buscar en la base de datos y regresar ese dato CAMBIAR
        $.each(self.data(), (index, dataObj) => {
          if (dataObj.id == queryId) {
            objData = dataObj;
          }
        });

        if (queryId && objData) {
          self.dataUpdate = objData;

          self.seguimientoArray(self.dataUpdate.datosGenerales.seguimiento);
          self.idIncidencia(self.dataUpdate.id)
          self.asunto(self.dataUpdate.datosGenerales.asunto)
          self.tipoUsuario(self.dataUpdate.personaAtendida.tipoUsuario)
          document.querySelector("#editarModal").open();
        }
        else {
          alert("Registro Invalido")
        }

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