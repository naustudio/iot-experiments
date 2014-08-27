// -----------------
// Read temperature
// -----------------

float val = 0;
// Create a variable that will store the temperature value
int temperature = 0;

void setup()
{
  // Register a Spark variable here
  Spark.variable("temperature", &temperature, INT);

  // Connect the temperature sensor to A7 and configure it
  // to be an input
  pinMode(A7, INPUT);
}

void loop()
{
  // Keep reading the temperature so when we make an API
  // call to read its value, we have the latest one
  
  val = (analogRead(A7) * 3.3)/4095;
  temperature = (val-0.5)*100;
}
