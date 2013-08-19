GCview
======

GC / open osurce memory management visualization and monitoring framework.
Licensed under the Apache Software License 2.0

---

GCview is a generic and easily adaptable visualization and monitoring 
framework targeted (but not limited) to memory management systems 
(garbage collectors, malloc/free implementations, hardware caches, etc.).  
A  system can be visualized by mapping its operation, data structures, heap 
layout, and other attributes onto GCView abstractions.

Its roots come from a similar tool known as GCspy. GCview is a new design 
and a completely separate code base.

The GCview core consists of three parts which can be hosted in the same place 
and be easily adopted in the required system:

A) Data Stream Spec - A JSON specification that defines the format of a data stream 
representing the state of the system being monitored over time as mapped onto GCview a
bstractions. The data stream can either be written to a file for future analysis or 
transmitted over the network for online monitoring.

B) Visualizer – A visualizer, written in HTML and JavaScript, that interprets and 
displays the above data stream.

C) Data Tracking Code – C++ code that keeps track of the data needed to monitor a 
particular system after it has been mapped onto GCview abstractions along with 
facilities to export this data in the  appropriate format.

The source also contains a set of example traces. Download the source and open index.html 
in your browser, then load a sample trace to play with GCview.
