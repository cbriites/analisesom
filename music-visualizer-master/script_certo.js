window.onload = function() {
  let array2 = [];

  const file = document.getElementById("file-input");

  const h3 = document.getElementById('name')
  const audio = document.getElementById("audio");



  var dados = new Map();
  var tempo = [];
  var amplitude = Array();
  var stop = 0;
  var onset = [];
  var tempo_onset = [];
  var timedomain1 = [];
  var timedomain2 = [];





  const canvasgraf = document.getElementById("myCanvas");
  const canvasgraf_ctx = canvasgraf.getContext("2d");
  let visibleScrollbars = window.scrollbars.visible;
  window.scroll(500, 0);
  canvasgraf.width = window.innerWidth;
  canvasgraf.height = window.innerHeight / 2;

  canvasgraf_ctx.beginPath();
  canvasgraf_ctx.lineJoin = "round";
  canvasgraf_ctx.lineWidth = 0.5;
  canvasgraf_ctx.fillStyle = "white";
  canvasgraf_ctx.fillRect(0, 0, canvasgraf.width, canvasgraf.height);




  const canvasgraf2 = document.getElementById("myCanvas2");
  const canvasgraf_ctx2 = canvasgraf2.getContext("2d");
  canvasgraf2.width = window.innerWidth;
  canvasgraf2.height = window.innerHeight / 3;

  canvasgraf_ctx2.beginPath();
  canvasgraf_ctx2.lineJoin = "round";
  canvasgraf_ctx2.lineWidth = 2;
  canvasgraf_ctx2.fillStyle = "white";
  canvasgraf_ctx2.fillRect(0, 0, canvasgraf.width, canvasgraf.height);



  file.onchange = function() {


    const files = this.files; // FileList containing File objects selected by the user (DOM File API)
    //console.log('FILES[0]: ', files[0])
    audio.src = URL.createObjectURL(files[0]); // Creates a DOMString containing the specified File object
    const name = files[0].name
    h3.innerText = `${name}` // Sets <h3> to the name of the file


    const context = new AudioContext(); // (Interface) Audio-processing graph
    let src = context.createMediaElementSource(audio); // Give the audio context an audio source,


    audio.addEventListener('loadedmetadata', function() {
      // Obtain the duration in seconds of the audio file (with milliseconds as well, a float value)
      const duration = audio.duration;





      // to which can then be played and manipulated
      const analyser = context.createAnalyser(); // Create an analyser for the audio context

      src.connect(analyser); // Connects the audio context source to the analyser
      analyser.connect(context.destination); // End destination of an audio graph in a given context
      // Sends sound to the speakers or headphones



      analyser.fftSize = 8192; //mostra os picos melhor mas perde resoluçao temporal


      const bufferLength = analyser.frequencyBinCount; // (read-only property)


      // The FFT size defines the number of bins used for dividing the window into equal strips, or bins.
      // Hence, a bin is a spectrum sample, and defines the frequency resolution of the window.

      const dataArray = new Uint8Array(bufferLength); // Converts to 8-bit unsigned integer array
      // At this point dataArray is an array with length of bufferLength but no values

      var dataArrayT = new Float32Array(analyser.fftSize);




      let barHeight;
      let x = 0;

      average = function(a) {
        var r = {
            mean: 0,
            variance: 0,
            deviation: 0,
            soma: 0
          },
          t = a.length;
        for (var m, s = 0, l = t; l--; s += a[l]);
        for (r.soma = s, m = r.mean = s / t, l = t, s = 0; l--; s += Math.pow(a[l] - m, 2));
        return r.deviation = Math.sqrt(r.variance = s / t), r;
      }

      const round = (num, places) => {
        if (!("" + num).includes("e")) {
          return +(Math.round(num + "e+" + places) + "e-" + places);
        } else {
          let arr = ("" + num).split("e");
          let sig = ""
          if (+arr[1] + places > 0) {
            sig = "+";
          }

          return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + places)) + "e-" + places);
        }
      }

      function getModes(array) {
        var frequency = {}; // array of frequency.
        var maxFreq = 0; // holds the max frequency.
        var modes = [];
      
        for (var i in array) {
          frequency[array[i]] = (frequency[array[i]] || 0) + 1; // increment frequency.
      
          if (frequency[array[i]] > maxFreq) { // is this frequency > max so far ?
            maxFreq = frequency[array[i]]; // update max.
          }
        }
      
        for (var k in frequency) {
          if (frequency[k] == maxFreq) {
            modes.push(k);
          }
        }
      
        return modes;
      }


      let cont = 0;




      ///////////////////////////////////////////////////////////////

      function renderFrame() {
        if (stop == 0) {
          //console.log("1",context.currentTime);
          var animation = requestAnimationFrame(renderFrame); // Takes callback function to invoke before rendering

          let ts = context.getOutputTimestamp();
          //console.log("time",ts.contextTime);
          //console.log("perf",context.outputLatency);

          x = 0;


          analyser.getFloatTimeDomainData(dataArrayT);

          //console.log("td2", dataArrayT.length);
          var expT = dataArrayT.map(x => (1.0 * Math.pow(x, 2)));
          var max_exp = expT.reduce(function(a, b) {
            return Math.max(a, b);
          });
          
          var meanT = average(expT).mean;
          timedomain1.push(max_exp); //grafico


          for (let i = 0; i < dataArrayT.length; i++) {

            timedomain2.push(expT[i]);

            //timedomain1.push(expT[i]);
          }




          analyser.getByteFrequencyData(dataArray); // Copies the frequency data into dataArray


          var max1 = dataArray.reduce(function(a, b) {
            return Math.max(a, b);
          });
          //console.log("datacont",cont, max1);

          var n = max1.toString();

          function getKeyByValue(object, value) {
            return Object.keys(object).find(key => object[key] === value);
          }

          //console.log(getKeyByValue(dataArray, max1), dataArray);



          let normalarray = Array.prototype.slice.call(dataArray);

          cont++;
          const gama = 100;

          var mod = normalarray.map(x => (1.0 * Math.abs(x)) / 255);

          mod = mod.map(x => (Math.log10(1 + gama * x * 1.0)));

          var max = mod.reduce(function(a, b) {
            return Math.max(a, b);
          });



          //diferenca

          if (array2.length < 1) {
            var amp = mod
          } else {
            var amp = mod.map((x, i) => x - array2[i]);


            amp = amp.map(x => Math.max(0, x));

            //var soma_amp = average(mod).soma;  USADO PARA DURAÇAO DAS NOTAS

            var soma_amp = average(amp).soma;

            //dados.set(context.currentTime, soma_amp);  //adiciona elemento ao dicionario

            amplitude.push(soma_amp);

            tempo.push(context.currentTime);


          }


          const escala = 4;

          //const escala = 1/5; USADO PARA DURAÇAO DAS NOTAS


          fator = canvasgraf.width / (duration);




          //////////// código usado para fazer convoluçao a um intervalo = janela


          var janela = 25

          /* if (cont % janela == 0){ var conv = analise(amplitude,tempo,cont-(janela-1),cont);

	var array_amp1 = nj.array(amplitude);

	//console.log("con", conv.max(), "amp", array_amp1.max());

	//console.log("conv", conv);
	
	for (let i = cont-(janela-1); i < cont; i++) {
      	
        if (i == 1){
	console.log("1"); 
          canvasgraf_ctx.moveTo(tempo[i]* fator, canvasgraf.height - (conv[i]*escala));

        } else{
  	console.log("2");
          canvasgraf_ctx.lineTo(tempo[i]* fator, canvasgraf.height - (conv[i]*escala));
	 
       	 }//else
	
	}//for

	canvasgraf_ctx.stroke()

	}//if cont%janela

	else */

          ///////////////////////////////


          if (context.currentTime.toFixed(1) == duration.toFixed(1)) {
            console.log("0", context.currentTime.toFixed(1), duration.toFixed(1));


            var timedomain = nj.array(timedomain1);

            var max2 = timedomain2.reduce(function(a, b) {
              return Math.max(a, b);
            });


            //var resto = cont % janela;

            var conv = analise(amplitude, tempo, 0, cont);
            //console.log(conv);


            var fatorX = makeArr(0, canvasgraf.width, timedomain1.length);
          

            for (let i = 0; i < timedomain1.length; i++) {

              console.log(timedomain1[i])

              if (i == 0 ) {


                canvasgraf_ctx.moveTo(fatorX[i], canvasgraf.height - (timedomain1[i] * 10000));

              } else {


                canvasgraf_ctx.lineTo(fatorX[i], canvasgraf.height  - (timedomain1[i] * 10000));
		canvasgraf_ctx.stroke();



              }

		

            }//gráfico de cima do sinal no domínio do tempo




            var maxTotal = timedomain2.reduce(function(a, b) {
              return Math.max(a, b);
            });




            var n = 0;

            var m = timedomain2.length - 1;

            var timenj = nj.array(timedomain2);
            var mediaTotal = timenj.mean();

            var valor_amp1 = 0.5 * mediaTotal;
            var valor_amp2 = 0.2 * maxTotal;


            while (timedomain2[n] < (valor_amp1)) { //VARIAVEL LIVRE
              n++;
            }



            while (timedomain2[m] < (valor_amp2)) { //VARIAVEL LIVRE
              m--;

            }

            

            var limite_inf = round(n / 8192, 0);

            var limite_sup = round(m / 8192, 0);

            //console.log("lim", limite_sup, m,cont);



            for (let i = 1; i < cont; i++) {


              if (i == 1) {

                canvasgraf_ctx.moveTo(tempo[i] * fator, canvasgraf.height - (conv[i] * escala));

              } else if (i == 2) {

                canvasgraf_ctx.lineTo(tempo[i] * fator, canvasgraf.height - (conv[i] * escala));

                if (conv[i - 1] < 1 && conv[i] > 1 && limite_sup >= i && i >= limite_inf - 5) {


                  onset.push(tempo[i]);
                  // console.log("onset",i, onset);
                  canvasgraf_ctx.lineTo(tempo[i] * fator, canvasgraf.height);
                  canvasgraf_ctx.lineTo(tempo[i] * fator, 0);
                  canvasgraf_ctx.lineTo(tempo[i] * fator, canvasgraf.height - (conv[i] * escala));

                }


              } else {

                canvasgraf_ctx.lineTo(tempo[i] * fator, canvasgraf.height - (conv[i] * escala));

                
                //var max_amp = amplitude_i.reduce(function(a, b) {
                  //return Math.max(a, b);
                //});


                if (conv[i - 1] < 1 && conv[i - 2] < 1 && conv[i - 3] < 2  && conv[i] > 1 && limite_sup >= i && i >= limite_inf - 5 ) { //VARIAVEL LIVRE
                var amplitude_i = timedomain2.slice(i*8192, (i+1)*8192);
                var amplitude_i0 = timedomain2.slice((i-1)*8192, (i)*8192);
                var media_amp = average(amplitude_i).mean;
                var media_amp0 = average(amplitude_i0).mean;
                var njamplitude = nj.array(amplitude_i);
                var max_amp = njamplitude.max();

                var njamplitude0 = nj.array(amplitude_i0);
                var max_amp0 = njamplitude0.max();

                  
                  
                  if (media_amp >= max_amp0){ 
                  console.log( media_amp, media_amp0, amplitude_i.length, amplitude_i0.length )};
                  onset.push(tempo[i]);

                  //console.log("onset",i, onset);
                  canvasgraf_ctx.lineTo(tempo[i] * fator, canvasgraf.height);
                  canvasgraf_ctx.lineTo(tempo[i] * fator, 0);
                  canvasgraf_ctx.lineTo(tempo[i] * fator, canvasgraf.height - (conv[i] * escala));
                  
                



                }



              }


            } //for 
            canvasgraf_ctx.stroke()

            for (let i = 1; i < onset.length; i++) {


              var dif = onset[i] - onset[i - 1];

              tempo_onset.push(round(dif, 3));
            }


            

            var max_i = [];
            var min_i = [];

            var mediana_onset = math.median(tempo_onset);

            var tempo_onset_array = nj.array(tempo_onset);

            var media_dif = tempo_onset_array.mean();

            var std_dif = tempo_onset_array.std();

            var tempo_onset_modificado = tempo_onset.map(x => Math.max(media_dif*0.9, x)); //PARAMETRO LIVRE

            tempo_onset_modificado = tempo_onset_modificado.map(x => Math.min(media_dif*2.5, x)); //PARAMETRO LIVRE

            console.log(tempo_onset_modificado)

            var tempo_modificado_array = nj.array(tempo_onset_modificado);

            var media_modificada = tempo_modificado_array.mean();

            var moda = getModes(tempo_onset_modificado);

            var BPM_media = round(60 / media_dif, 0);

            var BPM_moda = round(60 / moda, 0);

            var BPM_mediana = round(60 / mediana_onset, 0);

            var mad = math.mad(tempo_onset);

            var max_dif = tempo_onset_array.max();

            var min_dif = tempo_onset_array.min();

            for (let i = 1; i < onset.length; i++) {


              var dif = onset[i] - onset[i - 1];
              //console.log(dif, max_dif);

              if (round(dif, 3) == max_dif) {
                color = " red";
                max_i.push(i);

              } else if (round(dif, 3) == min_dif) {
                color = "blue";
                min_i.push(i);

              } else if (round(dif, 2) > round(media_dif, 2)) {
                color = "orange";

              } else if (round(dif, 2) == round(media_dif, 2)) {
                color = "black";

              } else {
                color = "green";
              }

              drawBar(canvasgraf_ctx2, onset[i - 1] * fator, canvasgraf2.height - (dif * 500), dif * fator, dif * 500, color, dif);
              canvasgraf_ctx2.moveTo(onset[i - 1] * fator, canvasgraf2.height);
              canvasgraf_ctx2.lineTo(onset[i - 1] * fator, 0);
              canvasgraf_ctx2.stroke();
            }


            canvasgraf_ctx2.moveTo(onset[onset.length - 1] * fator, canvasgraf2.height);
            canvasgraf_ctx2.lineTo(onset[onset.length - 1] * fator, 0);
            canvasgraf_ctx2.stroke();





            var dif_total = onset[onset.length - 1] - onset[0];

            //console.log(min_i, max_i, onset.length);

            canvasgraf_ctx.restore();

            canvasgraf_ctx.fillStyle = "black";

            canvasgraf_ctx.font = "15px Arial";

            canvasgraf_ctx.fillText(BPM_media + " BPM  " + BPM_mediana + " BPMM  " + BPM_moda+ " BPMModa  "+ mediana_onset + "mediana"+ moda + " moda  "+ media_modificada + " mediamod  ", 60, canvasgraf.height / 2 - 40);
            canvasgraf_ctx.fillText("STD = " + round(std_dif, 3) + "  MAD  " + round(mad, 3), 60, canvasgraf.height / 2 - 20);
            canvasgraf_ctx.fillText("Mean = " + round(media_dif, 3), 60, canvasgraf.height / 2);


            for (let i = 0; i < max_i.length; i++) {

              var nota1 = max_i[i];
              var nota2 = max_i[i] + 1;

              canvasgraf_ctx.fillText("O intervalo mais longo foi entre a " + nota1 + "º nota e a " + nota2 + "ºnota", canvasgraf.width - 500, (i * 15) + 50);
            }


            for (let i = 0; i < min_i.length; i++) {

              var nota1 = min_i[i];
              var nota2 = min_i[i] + 1;

              canvasgraf_ctx.fillText("O intervalo mais curto foi entre a " + nota1 + "º nota e a " + nota2 + "ºnota", canvasgraf.width - 500, canvasgraf.height / 2 - (i * 15));
            }








          } //else if context time 






          array2 = mod.slice();

          /// 1º gráfico 
          /*if (cont == 1){
          canvasgraf_ctx.moveTo(context.currentTime * fator, canvasgraf.height - (soma_amp*escala));
          }else{
          canvasgraf_ctx.lineTo(context.currentTime * fator, canvasgraf.height - (soma_amp*escala));
          canvasgraf_ctx.stroke();}*/
          /////

          //console.log("contador", cont);



          setTimeout(function() {
            stop = 1;
            window.cancelAnimationFrame(animation);
          }, duration * 1000);


        }

      }



      audio.play();
      const dados = renderFrame();



      function analise(amplitude, tempo, a, b) {

        // console.log(amplitude.length,"w");


        var NovaAmplitude = amplitude.slice([a, b]);

        //console.log(NovaAmplitude.length,"q");

        var NovaAmplitude2 = nj.convolve(NovaAmplitude, [1 / 9, 2 / 9, 3 / 9, 2 / 9, 1 / 9]).tolist(); //livre



        var filter_0 = [1, 1, 1, 1, 1, 1, 1]; // livre

        var filter = filter_0.map(x => x / average(filter_0).soma);

        var conv1 = nj.convolve(NovaAmplitude2, filter).tolist();



        var conv_amp = NovaAmplitude2.map((x, i) => x - conv1[i]);



        return conv_amp;
      }



      function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color, time) {
        console.log("1111")
        ctx.save();
        ctx.fillStyle = color;
        ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
        ctx.restore();
        ctx.font = "8px Arial";
        var time1 = round(time, 2);
        ctx.fillText(time1 + "s", upperLeftCornerX + 5, canvasgraf2.height);
      }


      function makeArr(startValue, stopValue, cardinality) {
        var arr = [];
        var step = (stopValue - startValue) / (cardinality - 1);
        for (var i = 0; i < cardinality; i++) {
          arr.push(startValue + (step * i));
        }
        return arr;
      }







    }, false); // audio duration

  };



};
