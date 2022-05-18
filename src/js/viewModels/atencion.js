
define(["require", "exports", "knockout", "ojs/ojarraydataprovider", "jquery", "ojs/ojpagingdataproviderview", "ojs/ojmutablearraydataprovider", "ojs/ojasyncvalidator-regexp",
  "ojs/ojtable", "ojs/ojbutton", "ojs/ojpopup", "ojs/ojformlayout", "ojs/ojaccordion", "ojs/ojradioset", "ojs/ojlabel", "ojs/ojlabelvalue", 'ojs/ojpagingcontrol',
  "ojs/ojinputtext", "ojs/ojfilepicker", "ojs/ojinputnumber", "ojs/ojselectsingle", "ojs/ojformlayout", "ojs/ojselectcombobox", 'ojs/ojinputsearch', "ojs/ojmessagebanner"],
  function (require, exports, ko, ArrayDataProvider, $, PagingDataProviderView, MutableArrayDataProvider, AsyncRegExpValidator) {
    function ViewModel() {
      var self = this;
      var token = "Bearer eyAidHlwIjogIkpXVCIsICJhbGciOiAiSFMyNTYiIH0.eyAidXNlcm5hbWUiOiJBRE1JTjAwNCIsImVtYWlsIjoiYWxleGlzLmJlbml0ZXpAaWVkZXAuZWR1Lm14Iiwib3duZXIiOjEsInJvbGUiOiJVU0VSIiwidXNlcl9sZXZlbCI6MSwiZ3JvdXAiOiJBRE1JTklTVFJBVElWT1MiLCJncm91cHMiOlsiQURNSU5JU1RSQVRJVk9TIiwiSyJdLCJpYXQiOjE2NTI4NjQ4ODcuOTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk2LCJleHAiOjE2NTI5NTEyODcuOTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk5OTk2IH0.FpQnmWSggjFWZz65S-5uupNiD7r5yK4xG76A6TrO1FQ";
      self.data = ko.observableArray([]); //Data de la tabla principal
      self.dataADM = ko.observableArray([]); //Data de los administradores que estan en el sistema
      self.dataAlu = ko.observableArray([]); //Data de los alumnos a quien pueden asociarse las incidencias
      self.seguimientoArray = ko.observableArray();
      self.personaAtendida = ko.observable();

      //Variables y funciones FILE
      self.files = ko.observable([]);
      self.filesSeguimiento = ko.observableArray([]);
      self.fileNames = ko.observable([]);
      primaryTextFilePicker = ko.observable("Adjunta archivos arrastrándolos y colocándolos aquí, seleccionándolos o pegándolos.")
      secondarytextFilePicker = ko.observable("Tipo de datos aceptados:JPG,JPEG,PDF,XLSX,DOCX")
      self.invalidMessage = ko.observable("")
      //FIN Inicializacion de variables a usar

      self.fecha = "";
      self.hora = "";
      self.idRegistroEliminar = 0;

      self.connected = () => {
        document.title = "Atencion";
        const initialData = [
          {
            id: 'error1',
            severity: 'error',
            summary: 'No existe ningun archivo',
            detail: 'No se ha cargado ningun archivo',
            closeAffordance: 'off'
          },
        ];
        this.messages = new MutableArrayDataProvider(initialData, {
          keyAttributes: 'id'
        });
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
            //console.log(data.items)
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
        self.descripcionSeguimiento = ko.observable("");
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

        //Metodos files
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
          self.obtenerSeguimiento(self.dataUpdate().id); /* Buscamos en la tabla de seguimientos si es que existe uno relacionado con esta incidencia */
          self.obtenerArchivos(self.dataUpdate().id); /* Obtenemos archivos de la incidencia */
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

         

          self.incidenciaDetail(dataObj.data);
          console.log(self.incidenciaDetail())
          if(self.incidenciaDetail().tipo_usuario == "Aspirante" ){
            self.personaAtendida(self.obtenerAspirante(self.incidenciaDetail().clave));
          }
          else if(self.incidenciaDetail().tipo_usuario == "Alumno" || self.incidenciaDetail().tipo_usuario == "Ex Alumno"){
            self.personaAtendida(self.obtenerAlumno(self.incidenciaDetail().clave));
          }
          else if(self.incidenciaDetail().tipo_usuario == "Representante" || self.incidenciaDetail().tipo_usuario == "Coordinador(a)"){
            self.personaAtendida(self.obtenerAdministrativo(self.incidenciaDetail().clave));
          }

          console.log(self.personaAtendida())


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


         

          self.dataUpdate().tipoUsuario = "datos BD pendientes" //Eliminamos cuando tengamos este elemento en la tabla
          document.getElementById("mostrarModal").open();
        }
      }

      self.obtenerAspirante = (CVECATASP) => {
        let aspirante = null;
        $.get({
          async:false,
          url: `https://sice.iedep.edu.mx:8282/dev/administrativos/aspirantes/aspirantes/${CVECATASP}`,
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        })
          .done((data) => {
            aspirante = data.items;
          })
          .fail((err, err2) => {
            console.log(err)
            console.log(err2)
          });

          return aspirante
      }

      self.obtenerAlumno = (matricula_alumno) => {
        let alumno = null;
        $.get({
          async:false,
          url: `https://sice.iedep.edu.mx:8282/dev/administrativos/alumnos/alumnos/${matricula_alumno}`,
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        })
          .done((data) => {
            alumno = data.items;
          })
          .fail((err, err2) => {
            console.log(err)
            console.log(err2)
          });

          return alumno;
      }

      self.obtenerAdministrativo = (CVECATPRO) => {
        let administrativo = null;
        $.get({
          async:false,
          url: `https://sice.iedep.edu.mx:8282/dev/administrativos/usuarios/usuarios/${CVECATPRO}`,
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        })
          .done((data) => {
            administrativo = data.items;
          })
          .fail((err, err2) => {
            console.log(err)
            console.log(err2)
          });

          return administrativo;
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

      this.validators = [
        new AsyncRegExpValidator({
          pattern: "^[^]+$",
          messageDetail: "Este campo es obligatorio",
        }),
      ];

      self.validarCamposCrear = () => {
        var datos = [
          {
            observable: self.asunto(),
            field_id: "asunto"
          },
          {
            observable: self.identificadorPersonaAtendida(),
            field_id: "identificadorPersonaAtendida"
          },
          {
            observable: self.tipoUsuario(),
            field_id: "tipoUsuario"
          },
          {
            observable: self.tipoAtencion(),
            field_id: "tipoAtencionCrear"
          },
          {
            observable: self.estatus(),
            field_id: "estatus"
          },
          {
            observable: self.descripcionSeguimiento(),
            field_id: "descripcionSeguimientoCrear"
          },
        ]
        var validFields = false;

        $.each(datos, function (index, element) {
          if (element.observable) { validFields = true }
          else if (element.observable == "") {
            let fieldmatricula = document.getElementById(element.field_id);
            fieldmatricula.showMessages();
            validFields = false;
            return false;
          }
        })

        return validFields;

      }
      //FUNCIONES CREAR REGISTRO ATENCION
      self.crearRegistro = () => {
        let registro = {};
        let dataPersonaAtendidaBD;
        let dataAdmBD;
        let seguimientoBD;
        if (self.validarCamposCrear()) {
          alert("Campos llenados correctamente");

        }
        else {
          alert("Es Necesario llenar todos los campos")
        }


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
        self.fecha = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, '0') + "-" + String(date.getDate()).padStart(2, '0');
        self.hora = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        console.log(self.fecha + ' ' + self.hora)
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

      self.crearSeguimientoBD = () => {
        let seguimiento;
        $.post({
          async: false,
          url: 'https://sice.iedep.edu.mx:8282/dev/administrativos/seguimiento/seguimiento',
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          data: JSON.stringify({
            "cvecatpro": "ADMIN005", //Se tomara del login
            "tipo_atencion": self.tipoAtencion(),
            "estatus": self.estatus(),
            "descripcion": self.descripcionSeguimiento(),
            "fecha_actualizacion": self.fecha + ' ' + self.hora,
            "incidencia_id": self.dataUpdate().id
          })
        })
          .done((data) => {
            seguimiento = {
              descripcion: self.descripcionSeguimiento(),
              estatus: self.estatus(),
              fecha_actualizacion: self.fecha + ' ' + self.hora,
              id: data.seguimiento_id,
              idecatpro: 4552, //Lo sacamos del Login
              incidencia_id: dataUpdate().id,
              nombre_administrativo: "Alexis Benítez Arellano", //Lo sacamos del login
              tipo_atencion: self.tipoAtencion(),
            }
            console.log(data)
          })
          .fail((err, err2) => {
            seguimiento = null;
            console.log(err)
            console.log(err2)
          });
        return seguimiento;
      }

      self.validarCamposSeguimiento = () => {
        var datos = [
          {
            observable: self.tipoAtencion(),
            field_id: "atencionEditar"
          },
          {
            observable: self.estatus(),
            field_id: "estatusEditar"
          },
          {
            observable: self.descripcionSeguimiento(),
            field_id: "descripcionSeguimientoEditar"
          }
        ]
        var validFields = false;

        $.each(datos, function (index, element) {
          if (element.observable) { validFields = true }
          else if (element.observable == "") {
            let fieldmatricula = document.getElementById(element.field_id);
            fieldmatricula.showMessages();
            validFields = false;
            return false;
          }
        })

        return validFields;
      }

      self.crearSeguimiento = () => {
        self.obtenerFecha();
        if (self.validarCamposSeguimiento()) {
          let seguimiento = self.crearSeguimientoBD();
          self.seguimientoArray.push(seguimiento);
          self.limpiarCampos();
          $("#agregarSeguimientoBtn").prop("disabled", false);
          self.camposSeguimientos(false);
          alert("Seguimiento creado")
        }
        else {
          alert("Debe de rellenar todos los campos")
        }

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

        //Campos Editar 

        //Campos Busqueda
        self.search('');
        self.rawSearch('');
        self.seguimientoArray.removeAll();
        self.filesSeguimiento.removeAll();
      }

      //FUNCIONES ELIMINAR REGISTRO DE ATENCION
      self.eliminarRegistro = (event) => {
        console.log("ITEM ELIMINADO "+event.target.id)
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

      this.obtenerSeguimiento = (id_incidencia) => {
        $.get({
          async: false,
          url: `https://sice.iedep.edu.mx:8282/dev/administrativos/seguimiento/seguimiento/${id_incidencia}`,
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        })
          .done((data) => {
            let seguimiento = data.items;
            self.seguimientoArray(seguimiento);
            
          })
          .fail((err, err2) => {
            console.log(err)
            console.log(err2)
          });
      }

      this.obtenerIncidencia = (id_incidencia) => {
        let incidencia = null;

        $.get({
          async: false,
          url: `https://sice.iedep.edu.mx:8282/dev/administrativos/incidencias/incidencias/${id_incidencia}`,
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        })
          .done((data) => {
            incidencia = data.items;
            self.dataUpdate(incidencia[0])
          })
          .fail((err, err2) => {
            incidencia = null;
            alert("Registro Invalido")
            console.log(err)
            console.log(err2)
          });

        return incidencia;
      }

      this.obtenerArchivos = (id_incidencia) => {
        $.get({
          async: false,
          url: `https://sice.iedep.edu.mx:8282/dev/administrativos/archivos/archivos/${id_incidencia}`,
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        })
          .done((data) => {
            let archivos = data.items;
            if (archivos != []) {
              $.each(archivos, function (index, arr) {
                self.filesSeguimiento.push(arr);
              })
            }
            console.log("Archivos del seguimiento: ");
            console.log(self.filesSeguimiento())
          })
          .fail((err, err2) => {
            console.log(err)
            console.log(err2)
          });
      }

      //FUNCIONES BUSCAR REGISTRO 
      self.searchRegister = function (event) {
        let queryId = event.detail.value;
        self.obtenerIncidencia(queryId);
        self.obtenerSeguimiento(queryId);
        self.obtenerArchivos(queryId);
        document.querySelector("#editarModal").open();
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