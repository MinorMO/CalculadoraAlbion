$(document).ready(function () {
  // Definir los colores para cada checkbox
  const colors = {
      T2: { background: '#e6e6e6', border: '#909090' },
      T3: { background: '#b7e6c9', border: '#2cbc63' },
      T4: { background: '#b7c9e6', border: '#2c63bc' },
      T5: { background: '#e6b7b7', border: '#bc2c2c' },
      T6: { background: '#e6c9b7', border: '#bc632c' },
      T7: { background: '#e6e6b7', border: '#bcbc2c' },
      T8: { background: '#f5f5f0', border: '#333333' }
  };

  // Manejar cambios en los checkboxes
  $('.dynamic-checkbox').change(function () {
      const checkboxId = $(this).attr('id');

      if ($(this).is(':checked')) {
          let inputGroup = `
              <div class="row mt-3" id="inputs-${checkboxId}">
                  <div class="col-12">
                      <h5 class="input-group-title">Refinamiento ${checkboxId}</h5>
                  </div>
                  <div class="col-md-4">
                      <label for="materiaPrima-${checkboxId}">Materia Prima</label>
                      <input type="number" id="materiaPrima-${checkboxId}" name="materiaPrima[${checkboxId}]" class="form-control materiaPrimaInput" placeholder="Materia prima">
                  </div>
                  <div class="col-md-4">
                      <label for="refinadoAnterior-${checkboxId}">Refinado ${checkboxId} anterior</label>
                      <input type="number" id="refinadoAnterior-${checkboxId}" class="form-control refinadoAnteriorInput" placeholder="Refinado anterior" readonly>
                  </div>
                  <div class="col-md-4">
                      <label for="totalRefinado-${checkboxId}">Total Refinado</label>
                      <input type="number" id="totalRefinado-${checkboxId}" class="form-control totalRefinadoInput" placeholder="Total refinado" readonly>
                  </div>
              </div>`;
          $('#inputsContainer').append(inputGroup);

          // Aplicar color correspondiente al input recién añadido
          $(`#inputs-${checkboxId} input`).css({
              'background-color': colors[checkboxId].background,
              'border-color': colors[checkboxId].border
          });

          // Ordenar los inputs después de añadir el nuevo grupo
          ordenarInputs();
      } else {
          $(`#inputs-${checkboxId}`).remove();
      }
  });

  // Función para ordenar los inputs en el contenedor
  function ordenarInputs() {
      const container = $('#inputsContainer');
      const inputs = container.children('.row').get();

      inputs.sort(function (a, b) {
          return $(a).attr('id').localeCompare($(b).attr('id'));
      });

      $.each(inputs, function (idx, item) {
          container.append(item); // Reordena los inputs en el contenedor
      });
  }

  // Manejar el envío del formulario
  $('#submitButton').click(function (event) {
      event.preventDefault();

      const focoGeneral = parseFloat($('#focoGeneral').val()) / 100;
      const checkedItems = $('.dynamic-checkbox:checked').map(function () { return this.value; }).get();
      const materiaPrima = {};

      $('.materiaPrimaInput').each(function () {
          const id = $(this).attr('id').split('-')[1];
          materiaPrima[id] = parseFloat($(this).val());
      });

      // Lógica de cálculo
      const resultado = calcular(focoGeneral, checkedItems, materiaPrima);

      // Actualizar los valores en los inputs correspondientes
      $.each(resultado.refinadoAnterior, function (id, value) {
          $(`#refinadoAnterior-${id}`).val(value);
      });

      $.each(resultado.totalRefinado, function (id, value) {
          $(`#totalRefinado-${id}`).val(value);
      });
  });

  // Función para realizar el cálculo
  function calcular(focoGeneral, checkedItems, materiaPrima) {
      const refinadoAnterior = {};
      const totalRefinado = {};
      const consumoPorElemento = {
          T2: [1, 0],
          T3: [2, 1],
          T4: [2, 1],
          T5: [3, 1],
          T6: [4, 1],
          T7: [5, 1],
          T8: [5, 1]
      };

      $.each(checkedItems, function (index, item) {
          if (materiaPrima[item] !== undefined) {
              const materia = materiaPrima[item];
              const consumos = consumoPorElemento[item];
              const consumo1 = consumos[0];
              const consumo2 = consumos[1];

              // Calcular refinado
              const resultado = calcularRefinado(focoGeneral, materia, consumo1, consumo2);
              refinadoAnterior[item] = resultado.cueroT3Usado;
              totalRefinado[item] = resultado.cuerosT4Fabricados;
          }
      });

      return { refinadoAnterior, totalRefinado };
  }

  // Función para calcular refinado
  function calcularRefinado(focoGeneral, materia, consumo1, consumo2) {
    //   let restanteMaterial = materia;
    //   let produccion = 0.0;

    //   while (restanteMaterial > consumo1) {
    //       produccion += restanteMaterial / consumo1;
    //       restanteMaterial = restanteMaterial * focoGeneral;
    //   }

    //   const refinadoAnterior = ((58/100) * materia).toFixed(1);
      
    //   const totalRefinado = produccion.toFixed(1);
    let cuerosT4Fabricados = 0;
  let cueroT3Usado = 0;
  let pielesT4Restantes = materia;
 let tasaRetorno = focoGeneral;
  // Mientras haya suficientes pieles T4 para craftear
  while (pielesT4Restantes >= consumo1) {
    // Realizar un crafteo de cuero T4
    cuerosT4Fabricados++;
    pielesT4Restantes -= consumo1;
    cueroT3Usado++;

    // Aplicar el retorno de materiales
    pielesT4Restantes += consumo1 * tasaRetorno;
    cueroT3Usado -= tasaRetorno;
  }

  // Redondear el cuero T3 usado al valor entero más cercano
cueroT3Usado = Math.ceil(cueroT3Usado);

      return { cueroT3Usado, cuerosT4Fabricados };
  }

  // Limpiar todos los checkboxes e inputs
  $('#clearButton').click(function () {
      $('.dynamic-checkbox').prop('checked', false);
      $('#inputsContainer').empty();
  });
});
