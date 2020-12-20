using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CarTracking.UI.Model;
using System.Net.Http;
using System.Net.Http.Headers;
using Newtonsoft.Json;

namespace CarTracking.UI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CarController : ControllerBase
    {
        private readonly ILogger<CarController> _logger;

        public CarController(ILogger<CarController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public Car Get()
        {
            var car1 = new Car()
            {
                LicensePlateNumber = "KZT110",
                Brand = "Peugeot",
                Model = "206 generation plus 1.4"
            };

            return car1;
        }

        /// <summary>
        /// Link para seguir el ejemplo para compartir una hoja de calculo de google
        /// https://www.jasoft.org/Blog/post/como-usar-una-hoja-de-calculo-de-google-como-backend-json
        /// Configuracion API KEY
        /// https://console.developers.google.com/apis/credentials?project=acceso-publico-gsheets-299216
        /// </summary>
        /// <returns></returns>
        [HttpGet("[action]")]
        public async Task<Car> Detail(string id)
        {
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Add("User-Agent", ".NET Foundation Repository Reporter");

            var stringTask = client.GetStringAsync("https://sheets.googleapis.com/v4/spreadsheets/1zys7fdduzD5hoT8qpfBAUqWU2E2hx1NXcf-gLlWzCBU/values/Respuestas%20de%20formulario%205!A:J?key=AIzaSyCl4FnoanV6Pmgg33-MF5GgzmUsK4Ua8Ew");
            var msg = await stringTask;

            var myDeserializedClass = JsonConvert.DeserializeObject<Root>(msg);
            Car car = null;

            foreach (var item in myDeserializedClass.values)
            {
                if(item.Count > 1 && item[2].ToUpper() == id.ToUpper())
                {
                    if(car == null)
                    {
                        car = new Car
                        {
                            LicensePlateNumber = item[2],
                            Brand = item[1]
                        };
                    }

                    var service = new CarService
                    {
                        Date = item[0],
                        Kilometers = Convert.ToInt32(item[3]),
                        OilFilter = item[4] == "SI",
                        AirFilter = item[5] == "SI",
                        FuelFilter = item[6] == "SI",
                        CabinFilter = item[7] == "SI",
                        OilComments = item[8],
                    };

                    car.Services.Insert(0, service);
                }
            }

            if (car == null)
                car = new Car();

            return car;
        }
    }

    public class Root
    {
        public string range { get; set; }
        public string majorDimension { get; set; }
        public List<List<string>> values { get; set; }
    }
}
