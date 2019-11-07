Project Description:
Website that matches Vendors and Buyers. The vendor have administrator privileges.


Features:
1-Add products
Implementation:
A vendor is able to add products to be browsed by buyers. The vendor can add products by giving it a name , price, style, availability country, and an image that is stored on disk. The image path is then stored in the database
2- Geolocation
Implementation:
Every time the dashboard of any buyer is loaded, the browser sends the Longitude and Latitude  to the server using the Geolocation interface. In the server side the buyer session location which stored in the buyer
database updates either to the USA, Canada, or Null based on the Longitude and Latitude .
3-Browse products
Implementation:
Buyers are only able to browse products based on their session location. If the buyer session location is null, all products are shown.

Database:
1-prod.db: used to store products
2-buyer.db: used to store the buyer accounts
3-vendor.db: used to store the buyer accounts

Possible Improvements:
1-Instead of updating the session every time a buyer dashboard is loaded, it will be better to update the location once at the start of the session.
2-Give vendors more administration privileges.

Test User:
Email:test1@hotmail.com
password:123
