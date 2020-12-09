using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarTracking.UI.Model
{
    public class Car
    {
        public string LicensePlateNumber { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string Color { get; set; }
        public int Year { get; set; }
        public string VehicleType { get; set; }
        public List<CarService> Services { get; set; }

        public Car()
        {
            Services = new List<CarService>();
        }
    }
}
