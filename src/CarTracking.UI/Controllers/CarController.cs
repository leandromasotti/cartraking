using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CarTracking.UI.Model;

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

        [HttpGet("[action]")]
        public Car Detail(string id)
        {
            //return new Car();

            var car1 = new Car()
            {
                LicensePlateNumber = "KZT110",
                Brand = "Peugeot",
                Model = "206 generation plus 1.4",
                Year = 2012,
                Color = "Negro",
            };

            CarService s2 = new CarService
            {
                Date = DateTime.Now.AddYears(-1).ToString("dd/MM/yyyy HH:mm:ss"),
                Kilometers = 155000,
                NextServiceKilometers = 165000,
                OilComments = "YPF Elaion 15w 40",
                OilFilter = true
            };

            car1.Services.Add(s2);

            CarService s = new CarService
            {
                Date = DateTime.Now.AddYears(-2).ToString("dd/MM/yyyy HH:mm:ss"),
                Kilometers = 140000,
                NextServiceKilometers = 150000,
                OilComments = "YPF Elaion 15w 40",
                OilFilter = true
            };

            car1.Services.Add(s);

            if (id != "KZT110")
            {
                car1.LicensePlateNumber = "AB505023";
                car1.Brand = "Renault";
                car1.Model = "Kangoo 3 puertas";
                car1.Year = 2018;
            }

            return car1;
        }
    }
}
