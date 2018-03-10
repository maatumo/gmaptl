import serial
import time

print "1"

ser = serial.Serial()
print "4"
ser.open()
print "5"

while 1:
 try:
  print ser.readline()
 except ser.SerialTimeoutException:
  print('Data could not be read')
