
define(["require", "exports", "knockout", "ojs/ojarraydataprovider", "ojs/ojbufferingdataprovider", "ojs/ojkeyset", "jquery", 'ojs/ojpagingdataproviderview', "text!../data/dataAdministrativos.json", "text!../data/dataAlumnos.json",
  "ojs/ojtable", "ojs/ojbutton", "ojs/ojpopup", "ojs/ojformlayout", "ojs/ojaccordion", "ojs/ojradioset", "ojs/ojlabel",
  "ojs/ojinputtext", "ojs/ojfilepicker", "ojs/ojinputnumber", "ojs/ojselectsingle", "ojs/ojformlayout", "ojs/ojselectcombobox", 'ojs/ojinputsearch'],
  function (require, exports, ko, ArrayDataProvider, BufferingDataProvider, ojkeyset_1, $, PagingDataProviderView, dataADM, dataAlu) {
    function ViewModel() {
      var self = this;

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
        self.dataUpdate = {}
        self.currentDisplayOption = ko.observable("grid");
        self.currentHorizontalGridVisible = ko.observable("disable");
        self.currentVerticalGridVisible = ko.observable("enable");
        $.get({
          url: 'js/data/atencion.json',

        }).done(function (data) {
          $.each(data, function (index, persona) {
            self.data.push(persona);
          })

        }).fail((err, err2) => {
          console.log(err, err2)
        });
        self.dataprovider = new BufferingDataProvider(new ArrayDataProvider(this.data, { keyAttributes: 'id' }));
        self.pagingDataProvider = new PagingDataProviderView(new ArrayDataProvider(this.data, { idAttribute: 'id' }));
        //Fin configuracion de los datos de la tabla


        //Configuracion Modal Crear
        //Inicializacion de variables a usar
        self.idAtencion = ko.observable(0);
        self.estudiante = ko.observable("");
        self.matricula = ko.observable("");
        self.administrativo = ko.observable("");
        self.tipoAtencion = ko.observable("");
        self.estatus = ko.observable("");
        self.asunto = ko.observable("");
        self.notas = ko.observableArray([]);
        self.camposNotas = ko.observable(false)

        //Variables Incidencia Detail
        self.idIncidencia = ko.observable();
        self.alumnoNombre = ko.observable();
        self.alumnoNumContacto = ko.observable();
        self.alumnoCorreoInstitucional = ko.observable();
        self.alumnoMatricula = ko.observable();
        self.alumnoCorreoPersonal = ko.observable();
        self.alumnoCampus = ko.observable();
        self.alumnoLicenciatura = ko.observable();

        self.administrativoNombre = ko.observable();
        self.administrativoNumExpediente = ko.observable();
        self.administrativoCorreoInstitucional = ko.observable();

        self.datosGeneralesFechaInicio = ko.observable();
        self.datosGeneralesEstatus = ko.observable();
        self.datosGeneralesTipoAtencion = ko.observable();
        self.datosGeneralesAsunto = ko.observable();
        self.datosGeneralesNotas = ko.observableArray([]);
        self.datosGeneralesFechaFin = ko.observable();
        //Fin variables Incidencia Detail 
        self.search = ko.observable('');
        self.rawSearch = ko.observable('');
        self.notasArray = ko.observableArray([]);
        //Variables y funciones FILE
        self.files = ko.observable([]);
        primaryTextFilePicker = ko.observable("Adjunta archivos arrastrándolos y colocándolos aquí, seleccionándolos o pegándolos.")
        secondarytextFilePicker = ko.observable("Tipo de datos aceptados:JPG,JPEG,PDF,XLSX,DOCX")
        self.multipleStr = ko.pureComputed(() => {
          return this.multiple()[0] ? "multiple" : "single";
        });
        self.isDisabled = ko.pureComputed(() => {
          return this.disabled()[0] === "disable" ? true : false;
        });
        self.invalidMessage = ko.observable("");
        self.invalidListener = (event) => {
          this.fileNames([]);
          this.invalidMessage("{severity: '" +
            event.detail.messages[0].severity +
            "', summary: '" +
            event.detail.messages[0].summary +
            "'}");
          const promise = event.detail.until;
          if (promise) {
            promise.then(() => {
              this.invalidMessage("");
            });
          }
        };
        self.acceptStr = ko.observable("image/jpg,image/jpeg,application/pdf,application/docx,application/xlsx"); //Tipo de datos aceptados
        self.acceptArr = ko.pureComputed(() => {
          const accept = self.acceptStr();
          return accept ? accept.split(",") : [];
        });
        self.fileNames = ko.observable([]);
        self.selectListener = (event) => {

          self.invalidMessage("");
          self.files(event.detail.files);
          self.fileNames(Array.prototype.map.call(self.files(), (file) => {
            return file.name;
          }));
        };
        //FIN Inicializacion de variables a usar

        //Configuraciones Atencion A:
        $.each(JSON.parse(dataAlu), (index, data) => { self.suggestionsAlu.push({ value: data.matricula, label: data.nombre }) })
        self.dataestudiante = new ArrayDataProvider(this.suggestionsAlu, { keyAttributes: "value", });
        //Fin config atencion a

        //Config atendido por
        $.each(JSON.parse(dataADM), (index, data) => { self.suggestionsADM.push({ value: data.numExpediente, label: data.nombre }) })
        self.dataadministrativo = new ArrayDataProvider(this.suggestionsADM, { keyAttributes: "value", });
        //Fin config atendido por

        //Config Tipo de atención
        self.datatipo_atencion = new ArrayDataProvider([
          { value: "Telefónica", label: "Telefónica" },
          { value: "Correo Electrónico", label: "Correo Electrónico" },
          { value: "Personal", label: "Personal" },],
          { keyAttributes: "value", });
        //Fin config tipo de atencion

        //Configuracion Estatus
        self.dataEstatusAtencion = new ArrayDataProvider([
          { value:"Se necesitan más datos", label:"Se necesitan más datos" },
          { value: "Rechazado", label: "Rechazado" },
          { value: "En proceso", label: "En proceso" },
          { value: "Finalizado", label: "Finalizado" }],
          { keyAttributes: "value", })
        //Fin configuracion estatus

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
          self.llenarCampos()
          document.querySelector("#editarModal").open();
        }
        else if (idBtnModal === "btnEliminar") {
          document.getElementById("eliminarModal").open();
        }
        else if (idBtnModal === "btnMostrar") {
          const element = document.getElementById('table');
          const currentRow = element.currentRow;
          const dataObj = element.getDataForVisibleRow(currentRow.rowIndex);

          self.idIncidencia(dataObj.data.id)
          self.alumnoNombre(dataObj.data.alumno.nombre)
          self.alumnoNumContacto(dataObj.data.alumno.numContacto)
          self.alumnoCorreoInstitucional(dataObj.data.alumno.correoInstitucional)
          self.alumnoMatricula(dataObj.data.alumno.matricula)
          self.alumnoCorreoPersonal(dataObj.data.alumno.correoPersonal)
          self.alumnoCampus(dataObj.data.alumno.campus)
          self.alumnoLicenciatura(dataObj.data.alumno.licenciatura)

          self.administrativoNombre(dataObj.data.administrativo.nombre)
          self.administrativoNumExpediente(dataObj.data.administrativo.numExpediente)
          self.administrativoCorreoInstitucional(dataObj.data.administrativo.correoInstitucional)

          self.datosGeneralesFechaInicio(dataObj.data.datosGenerales.fecha_inicio)
          self.datosGeneralesEstatus(dataObj.data.datosGenerales.estatus)
          self.datosGeneralesTipoAtencion(dataObj.data.datosGenerales.tipoAtencion)
          self.datosGeneralesAsunto(dataObj.data.datosGenerales.asunto)
          self.datosGeneralesNotas(dataObj.data.datosGenerales.notas)
          self.datosGeneralesFechaFin(dataObj.data.datosGenerales.fecha_fin)

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
        let dataAluBD;
        //Buscamos los datos del alumno: 
        // *** En produccion se tendra que hacer una busqueda a la base de datos. ***
        $.each(JSON.parse(dataAlu), (index, data) => {
          if (data.matricula === self.estudiante()) { 
              dataAluBD = data;
          }
        })

        registro = {
          id: self.data().length + 1, //Este dato sera generado cuando se cree el registro
          alumno: dataAluBD, 
          administrativo: { //Estos datos se obtendran del login 
            nombre: "alex3",
            numExpediente: "1960",
            correoInstituciona: "alex@iedep.edu.mx"
          },
          datosGenerales: {
            estatus: self.estatus(),
            tipoAtencion: self.tipoAtencion(),
            asunto: self.asunto(),
            notas: [{
              "descripcion": self.notas(),
              "archivos": self.files(),
              "fecha_creacion": new Date().toString()
            }]
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
        self.notasArray(self.dataUpdate.datosGenerales.notas);
        self.notas("")
      }


      self.actualizarRegistro = () => {
        self.dataUpdate.administrativo.numExpediente = self.administrativo()
        self.dataUpdate.datosGenerales.tipoAtencion = self.tipoAtencion()
        self.dataUpdate.datosGenerales.estatus = self.estatus()
        if (self.notas() != "") {
          self.dataUpdate.datosGenerales.notas.push(
            {
              "descripcion": self.notas(),
              "archivos": self.files(),
              "fecha_creacion": new Date().toString()
            }
          )
        }
        self.dataprovider.updateItem({ metadata: { key: self.dataUpdate.id }, data: self.dataUpdate });
        self.limpiarCampos();
        
        //Cerramos el modal
        document.getElementById("editarModal").close();
        
      }

      self.activarCamposNotas = (event) => {
        $(event.target).hide();
        self.camposNotas(true)
      }

      self.actualizarNotas = () => {
        let date = new Date()
        let fecha = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        let hora = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        self.notasArray.push(
          {
            "descripcion":self.notas(),
            "archivos":self.files(),
            "fecha_creacion": fecha + " - " + hora 
          }
        )
        self.notas("")
        self.files("")
        self.fileNames("")
        $("#agregarNotaBtn").show();
        self.camposNotas(false);
      }

      self.cancelActualizarNotas = () => {
        $("#agregarNotaBtn").show();
        self.camposNotas(false);
        self.notas("")
        self.files("")
      }

      self.limpiarCampos = () => {
        self.estudiante(""),
          self.administrativo(""),
          self.asunto(""),
          self.tipoAtencion(""),
          self.estatus(""),
          self.notas("")
          self.files("")
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
          document.getElementById("popup_mostrar");
          self.incidenciaDetail(objData);
          popup.open();
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
