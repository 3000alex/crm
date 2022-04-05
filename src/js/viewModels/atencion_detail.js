define(["require", "exports", "knockout","ojs/ojinputtext","ojs/ojaccordion", "ojs/ojradioset", "ojs/ojlabel"],
 function(require, exports, ko) {
    function ViewModel() {
      var self = this; 
      self.num_incidencia = ko.observable(1);
      self.usuarioAtendido = ko.observable(
        {
          'nombre':'alex',
          'num_contacto':'2121212134',
          'correoInstitucional':'ejemplo@iedep.edu.mx',
          'matricula':'20CL-28409',
          'correoPersonal':'personal@iedep.edu.mx',
          'campus':'NOPALUCAN',
          'licenciatura':'LICENCIATURA EN PEDAGOGIA',
          'tipo_usuario':"alumno",
        })

      self.administrativo = ko.observable(
        {
          'nombre':'alex',
          'numExpediente':'1959',
          'correoInstitucional':'alex@iedep.edu.mx',
        })

      self.datosGenerales = ko.observable(
        {
         
          'estatus':'En proceso ...',
          'tipo_atencion':'Personal',
          'asunto':'Error en el portal de alumnos',
          'observacion':'Se esta trabajando en enviar los accesos correctos a los alumnos que tienen problemas de acceso.',
          'fecha_inicio':'03/04/2022',
          'fecha_fin':'05/04/2022',
        });
     
      this.connected = () => {
        console.log(self.usuarioAtendido().nombre)
        // Implement further logic if needed
      };

      
      this.disconnected = () => {
        // Implement if needed
      };

      
      this.transitionCompleted = () => {
        // Implement if needed
      };
    }

    
    return ViewModel;
  }
);