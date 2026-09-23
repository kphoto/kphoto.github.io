00
25

I have a new idea 
I have signed up for a free account on supabase 
the project name is colorado
project id is wgtvebsxazxfapjtujce
project region is us-east-2

Auth version
2.197.0

PostgREST version
14.5

Postgres version
17.6.1.166

the idea is that nothing we do here in this story is blocking
if supabase stops working 
or more likely my account stops working 
or if the project freezes due to inactivity 
the website kphoto dot github dot io 
continues to function as it does today 

the idea is pretty simple... 
when someone goes to a page on our website 
we track that and we display live statistics 
there is no need for any authentication or authorization 
nor is there any desire to store raw ip addresses 
or any personally identifiable information 
there isn't even a desire to maintain a separate github repo for this stuff 
I am thinking straight up use the supabase online editor to create the tables 
or whatever we need 
and use postgrest 
when designing the schema be mindful of the limits of the free tier 
the goal is to only show real time data, 
not persist all visitor data until the heat death of the universe 
