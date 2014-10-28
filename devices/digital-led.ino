// Define the pins we're going to call pinMode on
int led0 = D0;  // You'll need to wire an LED to this one to see it blink.
int led1 = D1;
int currentValue = 0;

int showNumber(String command) {
    int value = command.charAt(0) - '0';
    value = value % 4;

    switch (value) {
        case 0:
            digitalWrite(led0, LOW);
            digitalWrite(led1, LOW);
            break;
        case 1:
            digitalWrite(led0, HIGH);
            digitalWrite(led1, LOW);
            break;
        case 2:
            digitalWrite(led0, LOW);
            digitalWrite(led1, HIGH);
            break;
        case 3:
            digitalWrite(led0, HIGH);
            digitalWrite(led1, HIGH);

            break;

    }
    // char c = (char *) value;
    Spark.publish("changeNumber", String(value));
    currentValue = value;
    return value;
}

int getNumber(String command) {
    return currentValue;
}

void onReset(const char *event, const char *data)
{
  int i = 0;
  i++;
  Serial.print(i);
  Serial.print(event);
  Serial.print(", data: ");
  if (data) {
    Serial.println(data);
  } else {
    Serial.println("NULL");
  }
  showNumber("0");
}
// This routine runs only once upon reset
void setup() {
  // Initialize D0 + D1 pin as output
  // It's important you do this here, inside the setup() function rather than outside it or in the loop function.
  pinMode(led0, OUTPUT);
  pinMode(led1, OUTPUT);

  //Register our Spark function here
   Spark.function("setNumber", showNumber);
   Spark.function("getNumber", getNumber);
   Spark.subscribe("reset", onReset);
}

void loop() {

}