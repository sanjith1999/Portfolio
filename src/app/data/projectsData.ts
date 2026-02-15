import { Types } from 'mongoose';
export interface Project {
  _id?: Types.ObjectId;
  visibility: boolean;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  features: string[];
  challenges: string[];
  solutions: string[];
  image?: string;
  githubLink: string;
  liveLink: string;
  duration: string;
  teamSize: string;
  role: string;
  sections: Section[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SubSection {
  id: string;
  heading?: string;
  content?: string[];
  points?: string[];
  equation?: string;
  image?: string;
  columns?: Column[];
}

export interface Section {
  id: string;
  heading: string;
  showInToc?: boolean; // <-- NEW
  content: string[];
  image?: string; 
  subSections?: SubSection[];
  columns?: Column[];
}
export interface Column {
  id: string;
  width?: number;
  type: 'text' | 'image' | 'points' | 'equation' | 'blank' | 'paragraphs'; 
  content: string | string[]; // Can be empty string for 'blank'
}

// export const projectsData: Project[] = [
//   {
//     id: 5,
//     title: "Social Media Analytics",
//     description:
//       "A comprehensive analytics platform for tracking social media performance and engagement metrics.",
//     longDescription: `This social media analytics platform helps businesses and creators understand their social media performance.
//     It provides detailed insights into engagement rates, follower growth, content performance, and audience demographics.

//     The platform supports multiple social media platforms including Instagram, Twitter, Facebook, and LinkedIn.
//     Users can generate custom reports, set up automated alerts, and track competitor performance.

//     Advanced features include sentiment analysis, hashtag tracking, and predictive analytics for optimal posting times.`,
//     technologies: [
//       "React",
//       "Node.js",
//       "PostgreSQL",
//       "Redis",
//       "D3.js",
//       "Socket.io",
//       "JWT",
//     ],
//     features: [
//       "Multi-platform social media integration",
//       "Real-time analytics dashboard",
//       "Custom report generation",
//       "Competitor analysis tools",
//       "Sentiment analysis",
//       "Automated alerts and notifications",
//       "Data visualization with charts",
//       "API for third-party integrations",
//     ],
//     challenges: [
//       "Handling large volumes of social media data",
//       "Real-time data processing and updates",
//       "Integrating multiple social media APIs",
//       "Creating intuitive data visualizations",
//       "Ensuring data accuracy and reliability",
//     ],
//     solutions: [
//       "Implemented Redis caching for improved performance",
//       "Used WebSocket connections for real-time updates",
//       "Created unified API layer for multiple social platforms",
//       "Utilized D3.js for interactive and responsive charts",
//       "Implemented data validation and error handling systems",
//     ],
//     image: "/images/image.jpg",
//     githubLink: "https://github.com/username/social-analytics",
//     liveLink: "https://social-analytics-demo.com",
//     duration: "4 months",
//     teamSize: "Team of 3",
//     role: "Full-stack Developer",
//     sections: [
//       {
//         id: "overview",
//         heading: "Overview",
//         content: [
//           "This project demonstrates a real-time data streaming application using Golang for backend and React for frontend.",
//         ],
//         image: "/images/image.jpg",
//       },
//       {
//         id: "architecture",
//         heading: "Architecture",
//         content: [
//           "The system follows a microservices architecture with gRPC for communication and WebSocket for real-time updates.",
//         ],
//         image: "/images/image.jpg",
//       },
//       {
//         id: "technologies",
//         heading: "Technologies Used",
//         content: [
//           "Key technologies include Golang, gRPC, SQLite, Flutter for the mobile interface, and Docker for containerization.",
//         ],
//         image: "/images/image.jpg",
//       },
//       {
//         id: "challenges",
//         heading: "Challenges & Solutions",
//         content: [
//           "One major challenge was handling concurrent clients efficiently. This was solved using Goroutines and channels in Go.",
//         ],
//         image: "/images/image.jpg",
//       },
//     ],
//   },
//   {
//     id: 6,
//     title: "Micro-Mouse Firmware Design",
//     description:
//       "Firmware for a two-wheel micro-mouse robot designed for RoboFest 2023, implementing precise control, navigation, and alignment strategies.",
//     longDescription: `This project involved designing and implementing firmware for a two-wheel micro-mouse robot for RoboFest-2023.
//   The firmware controls wheel speeds, navigation through a maze, and alignment using sensor feedback.
//   The project emphasizes real-time response, precision, and efficient navigation strategies using a combination of PD controllers, sensors, and wheel encoders.`,
//     technologies: [
//       "C++",
//       "Microcontroller Programming",
//       "IR Sensors",
//       "Gyroscope",
//       "Wheel Encoders",
//       "Bluetooth",
//     ],
//     features: [
//       "Two-wheel differential drive control",
//       "Real-time speed and alignment control",
//       "Box-to-box navigation strategy",
//       "Sensor-based alignment with IR and gyro",
//       "Smooth acceleration using PD controllers",
//       "Fast search-run and precise fast-run modes",
//     ],
//     challenges: [
//       "Maintaining precise movement through the maze",
//       "Reducing interference between IR sensors",
//       "Implementing responsive real-time control",
//       "Handling complex sensor data and timing",
//       "Optimizing alignment and navigation accuracy",
//     ],
//     solutions: [
//       "Used separate PD controllers for speed and alignment",
//       "Implemented timing strategies to reduce sensor interference",
//       "Optimized response cycles to 1 ms updates",
//       "Utilized wheel encoders and gyroscope for precise alignment",
//       "Developed navigation strategies for efficient maze traversal",
//     ],
//     image: "/images/microMouse/mouse.jpeg",
//     githubLink:
//       "https://github.com/sanjith1999/SINDiB-MicroMouse/tree/master?source=post_page-----c3c682946275---------------------------------------",
//     liveLink: "",
//     duration: "2 months",
//     teamSize: "Team of 3",
//     role: "Firmware Developer",
//     sections: [
//       {
//         id: "introduction",
//         heading: "Introduction",
//         content: [
//           "Last December, I had the opportunity to lead a team in designing a micro-mouse for the RoboFest-2023. We had a blast planning and implementing robust firmware for our micro-mouse, and now I finally have the chance to share some of the fun we had.",
//           "Instead of going over the basics or the traditional methods to solve maze-which you can easily find online, I want to dive into the unique implementation strategies we employed to elevate our game. While we did use the flood fill algorithm, this post will focus on the creative approaches that set our micro-mouse apart. Most parts of this article goes with both search-run and fast-run.",
//         ],
//         image: "/images/microMouse/mouse.jpeg",
//       },
//       {
//         id: "hardware",
//         heading: "Intro to the Hardware",
//         content: [
//           "For sensing walls and determining the relative position of our micro-mouse, we adopted the standard four IR sensor configuration. Together we utilized a gyroscope module and two highly precise wheel encoders.",
//           "We implemented the differential drive strategy to control the two wheels throughout the maze. For debugging purposes, we utilized 9 LEDs, an OLED display, and a Bluetooth module. (Although this article talks about basic run, the hardware choices are tailored for allowing the mice to perform diagonal run)",
//           "If you are interested in learning more about the rationale behind our choices feel free to visit our project.",
//         ],
//         image: "/images/microMouse/hardware_intro.jpeg",
//       },
//       {
//         id: "controller",
//         heading: "Controller Design",
//         content: [
//           "The controller is the man behind our micro-mouse’s wheels, adjusting their speeds to steer the robot through the maze. To keep the robot on track, the controller needs to know exactly where it is, relative to the starting point.",
//           "Even with precise sensors, things can get tricky. Minor jerks in movement and the little slides of wheels can add up, making it easy for the robot to crash into walls. At any point keeping the movements as smooth as possible is the game plan here.",
//           "To maintain a smooth speed profile we utilized mainly two kind of PD controllers.",
//         ],
//         image: "/images/microMouse/controller.jpeg",
//         subSections: [
//           {
//             id: "speed_control",
//             heading: "Speed Control",
//             content: [
//               "Speed controller keep things smooth, making sure there are no jerks(smooth acceleration profile) as the micro-mouse speeds up or slows down. Also it helps with ensuring the micro-mouse stops precisely where we want it to. When the micro-mouse is turning, we use the gyroscope to figure out where it needs to end up, while for straight movements, the wheel encoders come into play to get us to the right spot. For improved precision, parameter tuning is the key here.",
//             ],
//           },
//           {
//             id: "alignment_control",
//             heading: "Alignment Controller",
//             content: [
//               "Next up, we have the alignment controller. This one kicks in during the constant-speed phase. Depending on the situation, it uses either the wheel encoders or the IR sensors to keep the robot properly aligned as it moves forward. The alignment controller is actually made up of two separate PD controllers, each with four different sets of parameters tailored to support various speed ranges. More on this under alignment strategies.",
//               "PS: Why not PID? Considering stability issues we did not include the “I” term.",
//             ],
//           },
//         ],
//       },
//       {
//         id: "time_allocation",
//         heading: "Response Time Allocation",
//         content: [
//           "When it comes to driving fast, the key question is: how responsive is our driver? From the outset, we aimed to keep our controller very responsive.",
//           "After careful calculations, we decided on a 1 ms response time. In simple terms, this means the speed of each wheel gets updated every 1 ms as the mouse progresses through the maze. In firmware terms, at the end of each main loop (configured at 1 kHz), the speed of each wheel is updated based on sensor readings(SPA: Sense-Plan-Act).",
//           "Each speed update cycle consist of mainly three phases.",
//         ],
//         image: "/images/microMouse/response.jpeg",
//         subSections: [
//           {
//             id: "phase1",
//             heading: "Phase #01: IR Data Update",
//             image: "/images/microMouse/phase1.jpeg",
//             content: [
//               "Let’s say, we are running the microcontroller at a frequency of 72 MHz. An ADC on average takes around 96 cycles to sample one value. That means sampling a sensor value takes only around 1.33 µs. All four sensors take < 6 µs. What is the problem here? why do we need to allocate 500 µs then?",
//               "Consider a situation where the receiver of Sensor-I(referred to the image above) picks the rays from Sensor-II. We don’t want this kind of behavior. So what can we do? Switch on only the relevant transmitter when sampling a receiver value.",
//               "First off, since the chance of interference between Sensor-II and Sensor-III is super low, we can safely switch them on at the same time.",
//             ],
//           },
//           {
//             id: "points",
//             heading: "Now, let’s break it down:",
//             points: [
//               "Fire up Sensor-I’s transmitter for about 60 µs. During this time, we buffer the readings from its receiver. Then, we switch it off and wait for another 80 µs.",
//               "Next, do the same for Sensor-IV — turn on its transmitter for 60 µs, buffer the readings, switch it off, and wait for another 80 µs.",
//               "Finally, fire up the transmitters of Sensor-II and Sensor-III together for the next 60 µs, buffer the relevant readings, switch them off, and wait for another 80 µs.",
//               "These timing values might seem a bit magical, but 60 µs makes sense when you consider that the ADC needs about 2 µs per sample. Factoring in all the transition times, we can gather around 20 valid samples using a buffer in a shift-register fashion. And as for the switch-off time, anything more than 10 µs is plenty.",
//             ],
//           },
//           {
//             id: "phase2",
//             heading: "Phase #02: Gyro Data Update",
//             content: [
//               "Gather enough samples from gyro to determine facing angle.",
//               "Although this was our initial plan, SPI communication speed limit of the gyro module leads to congestion. Instead in our final implementation we update the gyro value with the help of an interrupt routine runs in half the speed of update cycles. (Using an analog gyro is the better choice here)",
//             ],
//           },
//           {
//             id: "phase3",
//             heading: "Phase #03: Calculation Phase",
//             content: [
//               "The sensing part is over. Plan and Act. In simple terms calculate and set the wheel speeds.",
//               "You might be wondering, “How on earth do the encoder values get updated?” Well, we use the encoder signals to update two timers, so the values get updated automatically without us having to lift a finger. Best part is encoder readings are always readily available in registers, we can access them whenever we need to.",
//             ],
//           },
//         ],
//       },
//       {
//         id: "navigation_strategy",
//         heading: "Box-to-Box Navigation Strategy",
//         content: [
//           "Our strategy here is pretty straightforward. We keep all our movements restricted to the space between two adjacent decision points (see the figure above). During the search run, when we hit a decision point, we sense the walls and evaluate the algorithm to figure out the next point to move toward. When it comes to a fast run, those decision points become more of a virtual concept. The movements still happen relative to these points, but the focus is on speed rather than stopping and evaluating at each one.",
//           "In our current setup, we’re only using 90° turns, which means we have to move to the center, make the turn, and then head to the next decision point. While this works, incorporating curved turns between decision points could really elevate the game and make the movements a lot more fluid and efficient.",
//         ],
//         image: "/images/microMouse/navigation.jpeg",
//       },
//       {
//         id: "alignment",
//         heading: "Alignment Strategies",
//         content: [
//           "As I mentioned earlier, the alignment controller is a key player during the constant speed phase. For those 90° turns, the alignment controller does its thing by relying on the wheel encoders to make a precise point turn. It’s the same story with 180° turns. But when it comes to straight movements, that’s where you can really make a difference.",
//         ],
//         image: "/images/microMouse/align.jpeg",
//         subSections: [
//           {
//             id: "search_run_alignment",
//             content: [
//               "Let’s consider a scenario where the mouse is moving through the maze as shown in the figure above. When it’s in cell 1, you can use both diagonal IR sensors to help align the mouse to the center of the cell while it’s moving.",

//               "As it moves through cell 2, you’ll want to use the diagonal IR sensor on the wall side to maintain a safe distance from the wall. But be careful — this can be tricky because you’ll need to rely on a pre-determined value for the distance from the wall, and that value can change depending on the lighting conditions. Here’s a tip: take some time at the start of the competition to set this value accurately.",

//               "For the next movement through cell 3, you won’t have any choice but to rely on the wheel encoders for alignment.",

//               "Even though I indicated configurations for individual cells, it actually makes more sense to think about movement between two decision points, especially when using diagonal IR sensors.",

//               "Also, watch out for the forward movement in cell 4. It’s not the same as the setup in cell 2. The non-symmetric reflection from the front wall can cause some issues. However, moving backward in cell 4 is just like the configuration in cell 2, so you’re good there. And when you’re in cell 5, the alignment process is the same as in cell 1.",

//               "For those of you who are into the theory, our alignment controller is essentially a PD controller with a subsumption architecture. In terms of priority, the cell 1 configuration comes first, followed by cell 2, and then cell 3. On top of that, each PD controller has four sets of parameters (Kp, Kd) to support different speed ranges. Honestly, the best way to get a feel for how it works is to play around with it yourself. But hey, don’t get too caught up in the fancy terms — just dive in and see what happens!",
//               "Even after all this, there are two main areas where the controller’s judgment can slip up:",
//               "1.The distance between the robot’s face and the center of the square it’s currently in.",
//               "2.The angle at which the robot is facing relative to the center axis of the maze path.",
//             ],
//           },
//           {
//             id: "image",
//             image: "/images/microMouse/path.jpeg",
//           },
//           {
//             id: "fast_run_alignment",
//             content: [
//               "For this, you can use the jackpot configurations shown in Figure A above. Obviously, you’ll need to make a 180° turn. Before you do that, use the two front-facing IR sensors to align both the angle and the distance from the wall. The same approach applies to the setups shown in Figures B and C. But, watch out for potential issues caused by reflections from non-symmetric walls. Remember, the robot isn’t aligned yet and might face a non-symmetric wall before it gets properly aligned.",
//               "Here’s a pro tip: Use the gyroscope and set a limit so the alignment controller doesn’t adjust the facing angle beyond a predetermined threshold. This will help avoid overcompensation and keep things on track.",
//             ],
//           },
//         ],
//       },
//       {
//         id: "conclusion",
//         heading: " Take It To The Next Level…!",
//         content: [
//           "Speed up recommendations",
//           "#01: Curved Turns: As mentioned earlier in the box-box navigation strategy make use of curved turns between decision points.",
//           "#02: Diagonal Run: I don’t want to complicate things here.",
//           "#03: Air Suction: Increases the friction and gives more grip to take sharp turns at very high speed.",
//         ],
//       },
//     ],
//   },
//   {
//     id: 7,
//     title: "PID Control in Mobile Robot",
//     description:
//       "An implementation of PID (Proportional‑Integral‑Derivative) control for a mobile robot to achieve stable trajectory following and speed regulation.",
//     longDescription: `
//     This project explores the design and implementation of a PID controller for a mobile robot platform.
//     The objective was to enable smooth and accurate motion control—specifically, speed and position regulation—using feedback from sensors and tuning of PID gains.

//     The robot uses differential drive wheels, encoders for odometry, and the controller adjusts motor commands to minimize error between set‑point and actual motion.
//     Key goals included reducing overshoot, improving settling time, and ensuring robust performance in varying conditions.
//   `,
//     technologies: [
//       "C/C++",
//       "Microcontroller Programming",
//       "Wheel Encoders",
//       "PID Control Algorithm",
//       "Differential Drive Robot",
//     ],
//     features: [
//       "Closed‑loop speed and position regulation",
//       "Dual wheel differential drive architecture",
//       "Encoder‑based odometry feedback",
//       "Tuning of PID gains (P, I, D) to optimize response",
//       "Reduced overshoot and faster settling time",
//       "Real‑time embedded control implementation",
//     ],
//     challenges: [
//       "Tuning PID gains for different motion modes",
//       "Dealing with drift and noise in encoder feedback",
//       "Achieving stable control with minimal overshoot",
//       "Handling robot dynamics and non‑idealities (wheel slip, unequal wheel radii)",
//       "Ensuring real‑time responsiveness on embedded hardware",
//     ],
//     solutions: [
//       "Performed iterative gain tuning using response experiments",
//       "Implemented encoder calibration for improved odometry accuracy",
//       "Limited integral term to prevent wind‑up and overshoot",
//       "Used differential drive kinematics model to compensate wheel mismatch",
//       "Optimized control loop timing for consistent real‑time performance",
//     ],
//     image: "/images/pid/pid.jpeg",
//     githubLink: "",
//     liveLink: "",
//     duration: "4 weeks",
//     teamSize: "Solo project",
//     role: "Embedded Systems & Control Engineer",
//     sections: [
//       {
//         id: "overview",
//         heading: "Overview",
//         content: [
//           "This section provides a high‑level view of the project: the motivation, objectives, and the mobile robot platform used.",
//         ],
//         image: "/images/pid_mobile_robot_overview.jpg",
//       },
//       {
//         id: "implementation",
//         heading: "Implementation Details",
//         content: [
//           "Describes how the PID controller was implemented on the microcontroller, integration of encoders, and motor control logic.",
//         ],
//         image: "/images/pid_mobile_robot_implementation.jpg",
//       },
//       {
//         id: "tuning",
//         heading: "PID Gain Tuning",
//         content: [
//           "Covers the process of tuning the P, I, and D parameters, analysis of response curves, and how settling time and overshoot were improved.",
//         ],
//         image: "/images/pid_mobile_robot_tuning.jpg",
//       },
//       {
//         id: "results",
//         heading: "Results & Observations",
//         content: [
//           "Shows the outcome of control experiments: actual vs. set‑point performance, measured reduction in error, and robustness to disturbances.",
//         ],
//         image: "/images/pid_mobile_robot_results.jpg",
//       },
//       {
//         id: "Long paragraphs",
//         heading: "Results & Observations",
//         content: [
//           "This social media analytics platform helps businesses and creators understand their social media performance.",
//           "It provides detailed insights into engagement rates, follower growth, content performance, and audience demographics.",
//           "Advanced features include sentiment analysis, hashtag tracking, and predictive analytics for optimal posting times.",
//         ],
//         image: "/images/pid_mobile_robot_results.jpg",
//       },
//     ],
//   },
// ];

// export const getProjectById = (id: string) => {
//   return projectsData.find((project) => project._id === parseInt(id));
// };
