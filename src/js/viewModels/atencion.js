
define(["require", "exports", "knockout", "ojs/ojarraydataprovider", "ojs/ojbufferingdataprovider", "ojs/ojkeyset", "jquery", "ojs/ojpagingdataproviderview",
  "ojs/ojtable", "ojs/ojbutton", "ojs/ojpopup", "ojs/ojformlayout", "ojs/ojaccordion", "ojs/ojradioset", "ojs/ojlabel", "ojs/ojlabelvalue", 'ojs/ojpagingcontrol',
  "ojs/ojinputtext", "ojs/ojfilepicker", "ojs/ojinputnumber", "ojs/ojselectsingle", "ojs/ojformlayout", "ojs/ojselectcombobox", 'ojs/ojinputsearch'],
  function (require, exports, ko, ArrayDataProvider, BufferingDataProvider, ojkeyset_1, $, PagingDataProviderView,) {
    function ViewModel() {
      var self = this;
      var token = "Bearer eyAidHlwIjogIkpXVCIsICJhbGciOiAiSFMyNTYiIH0.eyAidXNlcm5hbWUiOiJBRE1JTjAwNCIsImVtYWlsIjoiYWxleGlzLmJlbml0ZXpAaWVkZXAuZWR1Lm14Iiwib3duZXIiOjEsInJvbGUiOiJVU0VSIiwidXNlcl9sZXZlbCI6MSwiZ3JvdXAiOiJBRE1JTklTVFJBVElWT1MiLCJncm91cHMiOlsiQURNSU5JU1RSQVRJVk9TIiwiSyJdLCJpYXQiOjE2NTIzNjM5MDUsImV4cCI6MTY1MjQ1MDMwNSB9.APPQXuhQwUpoArI0KVab6Y5LXVGGQJ-kC-uQbwit39U";
      self.data = ko.observableArray([]); //Data de la tabla principal
      self.dataADM = ko.observableArray([]); //Data de los administradores que estan en el sistema
      self.dataAlu = ko.observableArray([]); //Data de los alumnos a quien pueden asociarse las incidencias
      self.fecha = "";
      self.hora = "";
      self.idRegistroEliminar = 0;

      self.connected = () => {
        document.title = "Atencion";

        //Configuramos la tabla
        $.get({
          url: 'https://sice.iedep.edu.mx:8282/dev/administrativos/incidencias/incidencias',
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        })
          .done((data) => {
            self.data(data.items)
            console.log(data.items)
          })
          .fail((err, err2) => {
            console.log(err)
            console.log(err2)
          });

        this.pagingDataProvider = new PagingDataProviderView(new ArrayDataProvider(self.data, { idAttribute: 'id' }));
        self.dataUpdate = ko.observable({}) //Variables para actualizar tabla
        //Fin configuracion tabla

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
        self.incidenciaDetail = ko.observable({});
        self.administrativo = ko.observable({});
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
        self.filesSeguimiento = ko.observableArray([]);
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

          const element = document.getElementById('table');
          const currentRow = element.currentRow;
          const dataObj = element.getDataForVisibleRow(currentRow.rowIndex);
          self.dataUpdate(dataObj.data);
          self.dataUpdate().tipoUsuario = "datos BD pendientes" //Eliminamos cuando tengamos este elemento en la tabla

          /* Buscamos en la tabla de seguimientos si es que existe uno relacionado con esta incidencia */
          $.get({
            url: `https://sice.iedep.edu.mx:8282/dev/administrativos/seguimiento/seguimiento/${self.dataUpdate().id}`,
            headers: {
              "Authorization": token,
              "Content-Type": "application/json"
            }
          })
            .done((data) => {
              self.seguimientoArray(data.items)
              //console.log(data.items)

            })
            .fail((err, err2) => {
              console.log(err)
              console.log(err2)
            });
          /* Finalizamos la busqueda del seguimiento */
          $.get({
            url: `https://sice.iedep.edu.mx:8282/dev/administrativos/archivos/archivos/21`,
            headers: {
              "Authorization": token,
              "Content-Type": "application/json"
            }
          })
            .done((data) => {
              
              console.log(data.items)

            })
            .fail((err, err2) => {
              console.log(err)
              console.log(err2)
            });



          document.querySelector("#editarModal").open();
        }

        else if (idBtnModal === "btnEliminar") {
          const element = document.getElementById('table');
          const currentRow = element.currentRow;
          const dataObj = element.getDataForVisibleRow(currentRow.rowIndex);
          self.idRegistroEliminar = dataObj.data.id;
          document.querySelector("#eliminarModal").open();
        }

        else if (idBtnModal === "btnMostrar") {
          const element = document.getElementById('table');
          const currentRow = element.currentRow;
          const dataObj = element.getDataForVisibleRow(currentRow.rowIndex);
          $.get({
            url: `https://sice.iedep.edu.mx:8282/dev/administrativos/incidencias/incidencias/${dataObj.data.id}`,
            headers: {
              "Authorization": token,
              "Content-Type": "application/json"
            }
          })
            .done((data) => {
              self.incidenciaDetail(data.items[0])
              console.log(data.items[0].idecatalu)
              $.get({
                url: `https://sice.iedep.edu.mx:8282/dev/administrativos/usuarios/usuarios/${data.items[0].idecatalu}`,
                headers: {
                  "Authorization": token,
                  "Content-Type": "application/json"
                }
              })
                .done((data) => {
                  self.administrativo(data.items[0]);
                  console.log(self.administrativo())
                })
                .fail((err) => {

                })
            })
            .fail((err) => { console.log(err) })



          self.incidenciaDetail(dataObj.data);
          self.incidenciaDetail().tipoUsuario = "alumno" //Lo quitamos cuando tengamos este atributo en la base de datos 
          self.incidenciaDetail().identificador = "";

          /*
          self.incidenciaDetail().idecatalu = ko.observable({ //IdPersona proximamente
            id:self.incidenciaDetail.idecatalu,
            nombre:"nombre P atendida",
            numContacto: "num P atendida",
            correoInstitucional: "correoPAtenidida@iedep.edu.mx",
            correoPersonal: "correoPPatendida@iedep.edu.mx",
            campus: "campusPAtendida",
            planEstudios: "planPAtendida"
          })
          console.log(self.incidenciaDetail().idecatalu)
          */


          if (self.incidenciaDetail().tipoUsuario == "aspirante") {
            self.incidenciaDetail.identificador = "23123"
          }
          else if (self.incidenciaDetail().tipoUsuario == "alumno" || self.incidenciaDetail().tipoUsuario == "ex alumno") {
            self.incidenciaDetail.identificador = "20CL42352"
          }
          else if (self.incidenciaDetail().tipoUsuario == "representante" || self.incidenciaDetail().tipoUsuario == "coordinador") {
            self.incidenciaDetail.identificador = "1254"
          }

          self.dataUpdate().tipoUsuario = "datos BD pendientes" //Eliminamos cuando tengamos este elemento en la tabla
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
          self.dataUpdate({})
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
        if (self.asunto() && self.identificadorPersonaAtendida() && self.tipoUsuario() && self.tipoAtencion() && self.estatus() && self.seguimiento()) {
          alert("campo lleno")
        }
        else {
          alert("Falta por rellenar un campo")
        }
        return
        //Configuramos fecha: 
        self.obtenerFecha();
        //Fin configuracion fecha. 
        let settings = {
          url: "https://sice.iedep.edu.mx:8282/dev/administrativos/incidencias/incidencias",
          method: "POST",
          timeout: 0,
          headers: {
            "Authorization": "Bearer eyAidHlwIjogIkpXVCIsICJhbGciOiAiSFMyNTYiIH0.eyAidXNlcm5hbWUiOiJBRE1JTjAwMyIsImVtYWlsIjoiYWxlamFuZHJvLnJhbWlyZXpAaWVkZXAuZWR1Lm14Iiwib3duZXIiOjEsInJvbGUiOiJVU0VSIiwidXNlcl9sZXZlbCI6MSwiZ3JvdXAiOiJBRE1JTklTVFJBVElWT1MiLCJncm91cHMiOlsiQURNSU5JU1RSQVRJVk9TIiwiSyJdLCJpYXQiOjE2NTA5ODM4MzcuOTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5LCJleHAiOjE2NTEwNzAyMzcuOTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5IH0.o0FHEY5EGsmtCMNLbiA4Uv186fjZSiilRvnTvpv1Ew8",
            "Content-Type": "application/json"
          },
          data: JSON.stringify()
        }
        $.post(settings)
          .done(() => {

          })
          .fail(() => {

          });
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

        self.limpiarCampos();
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
        self.idAtencion(0);
        self.tipoUsuario("");
        self.identificadorPersonaAtendida("");
        self.administrativo("");
        self.tipoAtencion("");
        self.estatus("");
        self.asunto("");
        self.seguimiento([]);
        self.camposSeguimientos(false)
        self.fileNames("");
        self.files = ko.observable([]);
        console.log("pase a limpiar los campos")

      }

      //FUNCIONES ELIMINAR REGISTRO DE ATENCION
      self.eliminarRegistro = (event) => {
        console.log(event.target.id);
        let index = "";
        if (event.target.id == "registroEliminar") {
          $.each(self.data(), function (i, arr) {
            if (arr.id == self.idRegistroEliminar) { index = i; }
          });

          self.data.splice(index, 1);
        }


        //Eliminamos de la BD: 

        //Fin eliminamos BD

        document.getElementById("eliminarModal").close();
        console.log(self.data());
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