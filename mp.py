# cs.???? = currentstate, any variable on the status tab in the planner can be used.
# Script = options are 
# Script.Sleep(ms)
# Script.ChangeParam(name,value)
# Script.GetParam(name)
# Script.ChangeMode(mode) - same as displayed in mode setup screen 'AUTO'
# Script.WaitFor(string,timeout)
# Script.SendRC(channel,pwm,sendnow)
# 
import datetime
import time

todaydetail=datetime.datetime.today()


print 'Start Script'

print  cs.lat
print  cs.lng

end=900
#time out: 1hour = 3600sec
for i in range(1,end):
    print "res"
    print end-i
    todaydetail=datetime.datetime.today()
    pos = str(cs.lat)+","+str(cs.lng)+","+str(todaydetail)
    f = open('mptext.txt', 'w')
    f.write(pos)
    f.close()
    time.sleep(4)

print "finished"

