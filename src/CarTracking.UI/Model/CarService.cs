using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarTracking.UI.Model
{
    public class CarService
    {
        public int Kilometers { get; set; }
        public string Date { get; set; }
        public int NextServiceKilometers { get; set; }
        public string OilComments { get; set; }
        public bool OilFilter { get; set; }
        public bool AirFilter { get; set; }
        public bool FuelFilter { get; set; }
        public bool CabinFilter { get; set; }
    }
}
