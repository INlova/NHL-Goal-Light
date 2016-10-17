
import time

import RPi.GPIO as GPIO
import time
# blinking function
def blink(pin):
        GPIO.setmode(GPIO.BOARD)
        GPIO.setup(pin, GPIO.OUT)
        GPIO.output(pin,GPIO.HIGH)
        for i in range(0, 3):
                print(str(i) + "...")
                time.sleep(1)
        GPIO.output(pin,GPIO.LOW)
        time.sleep(1)
        GPIO.cleanup()
        return
# to use Raspberry Pi board pin numbers
print("Home team scored!")
blink(12)
