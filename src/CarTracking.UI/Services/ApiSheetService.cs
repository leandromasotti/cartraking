using Google.Apis.Auth.OAuth2;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using Google.Apis.Services;
using Google.Apis.Util.Store;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
namespace CarTracking.UI.Services
{
    public class ApiSheetService
    {
        // If modifying these scopes, delete your previously saved credentials
        // at ~/.credentials/sheets.googleapis.com-dotnet-quickstart.json
        static string[] Scopes = { SheetsService.Scope.SpreadsheetsReadonly };
        static string ApplicationName = "Google Sheets API .NET Quickstart";

        public Model.Car GetData(string licensePlateNumber)
        {
            UserCredential credential;

            using (var stream = new FileStream("credentials.json", FileMode.Open, FileAccess.Read))
            {
                // The file token.json stores the user's access and refresh tokens, and is created
                // automatically when the authorization flow completes for the first time.
                string credPath = "token.json";
                credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                    GoogleClientSecrets.Load(stream).Secrets,
                                Scopes,
                                "user",
                                CancellationToken.None,
                                new FileDataStore(credPath, true)).Result;
                Console.WriteLine("Credential file saved to: " + credPath);
            }

            // Create Google Sheets API service.
            var service = new SheetsService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = credential,
                ApplicationName = ApplicationName,
            });

            // Define request parameters.
            string spreadsheetId = "1zys7fdduzD5hoT8qpfBAUqWU2E2hx1NXcf-gLlWzCBU";
            string range = "Class Data!A2:J";
            SpreadsheetsResource.ValuesResource.GetRequest request =
                    service.Spreadsheets.Values.Get(spreadsheetId, range);

            // Prints the names and majors of students in a sample spreadsheet:
            // https://docs.google.com/spreadsheets/d/1zys7fdduzD5hoT8qpfBAUqWU2E2hx1NXcf-gLlWzCBU/edit
            ValueRange response = request.Execute();
            IList<IList<object>> values = response.Values;
            var car = new Model.Car();

            if (values != null && values.Count > 0)
            {
                foreach (var row in values)
                {
                    if (row[2].ToString().Remove(' ').ToUpper() == licensePlateNumber.ToUpper())
                    {
                        car.Model = row[1].ToString();
                        car.LicensePlateNumber = row[2].ToString();

                        string date = row[0].ToString();
                        Model.CarService se = new Model.CarService
                        {
                            //Date = date.ToString("dd/MM/yyyy HH:mm:ss"),
                            Date = date,
                            Kilometers = Convert.ToInt32(row[3].ToString()),
                            OilFilter = GetBooleanValue(row[4]),
                            AirFilter = GetBooleanValue(row[5]),
                            FuelFilter = GetBooleanValue(row[6]),
                            CabinFilter = GetBooleanValue(row[7]),
                            //NextServiceKilometers = 165000,
                            OilComments = row[8].ToString(),
                        };

                        car.Services.Insert(0, se);
                    }
                }
            }
            else
            {
                //Console.WriteLine("No data found.");
            }

            return car;
        }

        private bool GetBooleanValue(object value)
        {
            if (value != null && value.ToString().ToUpper() == "SI")
            {
                return true;
            }
            return false;
        }
    }
}
