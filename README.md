# Snake
A browser-based version of the classic snake game with varying difficulties and score-tracking.

Try it out here: [Snake, hosted on Heroku](https://acollino-snake.herokuapp.com/)

## Usage
Users can start playing immediately by clicking the start button, but high scores and match history will only be shown to users that log in. Normal difficulty is pre-selected, but users can also choose Hard or Expert difficulties for a 2x or 3x point multiplier.

Users can control the snake's movement using the arrow keys.

The game follows the traditional expectations for snake:
 - The snake constantly moves forward and must be guided into touching a food block.
 - Eating the spawning food will extend the snake and increase your score.
 - The game ends when the snake collides with anything that isn't food - the edge of the board, a wall, or itself.

The page also shows users a randomly selected 'Snake of the Day', with corresponding links to the photo provider pages as well as to the species' wikipedia page, should any users want to learn more.

## Code Information
### Database
Users, Matches, and their associations are stored in their corresponding tables in the database.

User rows store a username and a password hashed using Bcrypt, and use a numerical ID for a primary key. The User model class additionally contains methods for creating a User and authenticating a login attempt.

Match rows store the match's starting time, the difficulty level, and use a numerical ID for a primary key. Match rows can also contain a column identifying a winner, which was meant as part of implementing multiplayer gameplay, though this is not used in the current version.

Similarly, the association table between users and matches, AssociationMatchUser, was also implemented with multiplayer gameplay in mind. This would allow users and matches to have a many-to-many relationship, as users could participate in many matches and multiple users could be involved in the same match. While the multiplayer gameplay was not implemented, this organization meant that this association table could store information unique to a single user in a match, such as their score and the time they stopped playing.

### Snake of the Day
The 'Snake of the Day' element is an exercise in utilizing external APIs. When a user first accesses the site, the page requests a list of snake details from the [Animals API, by API-Ninjas](https://api-ninjas.com/api/animals). This list is converted into an array of names, which is stored in localStorage to reduce the number of requests on subsequent site visits. A snake is chosen at random from this array every day, which becomes the snake of the day.

To load the image and details, a second API is used: [the iNaturalist API](https://api.inaturalist.org/v1/docs/), which allows users to document their wildlife encounters. The selected snake's name is used as a search query, and the search results contain the taxa best fitting that name, along with image URLs for each taxon. The image data is parsed to ensure it is covered by a creative-commons license, and the corresponding link to that license is generated to allow attribution requirements. The URLs from iNaturalist are similarly stored in localStorage to reduce requests while the Snake of the Day has not changed.

### Game
The game runs using Javascript, relying on EventListeners to recognize user inputs to move the snake. The game board is a canvas element that is repeatedly drawn using animation frames - though only the moving tail region is cleared to preserve the position of food and walls. The snake itself was developed with an object-oriented design, using a base GameItem that is used in the Food, Wall, and SnakeSegment classes.

To ensure that the snake remains aligned to the food and the walls, the snake's movement is broken up into portions of a single snake segment, and turns are gradually propagated between segments to maintain the same route throughout the snake. Additionally, the snake can only turn while it is aligned to this segment-based grid, and any inputs issued between valid turn timings are instead queued.

For ease of use, a Queue class is used to contain user inputs in a FIFO fashion. The queue allows rapid inputs that require precise timing, such as turning the snake around a corner or moving alongside itself, but it will not prevent user error - an input that will lead to a game-over will be processed just as a regular input would.

## Previews
<img src="https://user-images.githubusercontent.com/8853721/196015927-3ac17d1a-bfda-47e2-b76b-6d955dc025a2.png" alt="Snake home page" style="width: 700px">

<img src="https://user-images.githubusercontent.com/8853721/196015954-510dfa6c-0fd8-4d37-81d9-63eaf0314026.png" alt="User match history" style="height: 500px;">
