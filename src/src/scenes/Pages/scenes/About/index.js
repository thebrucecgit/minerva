import React from "react";

import bruce_chen from "./images/bruce_chen.jpg";
import isaac_heap from "./images/isaac_heap.jpg";
import oscar_gosling from "./images/oscar_gosling.jpg";

import styles from "./styles.module.scss";

function About() {
  return (
    <div>
      <div className="header">
        <h1>About Academe</h1>
      </div>
      <div className="container">
        <h3>Vision</h3>
        <p>
          Our vision is to supply all children with a quality education for a
          budget price. If everything goes perfectly we would have many children
          of lower socio-economic backgrounds benefiting from our service.
        </p>
        <h3>Business</h3>
        <p>
          Academe is a non-profit partnership dedicated to providing quality
          education at an affordable price.
        </p>
        <h3>Idea</h3>
        <p>
          There are many people from lower socio-economic situations that need a
          quality tutoring service to assist them in succeeding NCEA. The
          average violin lesson costs $80 per hour, and the fact is that the
          majority of people cannot afford even a fraction of this price. Our
          idea is to get students to teach others for a very minimal price. Kids
          all have specific skills, and by marketing these skills we can give
          both the students jobs, and the ones wanting to learn teachers. High
          school students live at home, and thus they do not require a lot of
          money. They will appreciate any kind of money they can get as they
          don’t have expenses and thus this will be on top.
        </p>
        <h3>Our Directors</h3>
        <div className={styles.person}>
          <h4>Oscar Gosling</h4>
          <p>
            <em>Managing Director</em>
          </p>
          <div className={styles.body}>
            <img src={oscar_gosling} alt="Oscar Gosling" />
            <div className={styles.description}>
              <p>
                Oscar has always had a passion for helping others, often
                teaching his peers at primary school as he worked at a level
                several years ahead of them. Academic extension could only
                inspire him so much, however, and he branched out to properly
                fulfill his love for music and the performing arts. He did this
                mostly through musical theatre with Kirwee Players Inc. Further,
                he involved himself in the procedural and financial runnings of
                the society, attending committee meetings and Annual General
                Meetings.
              </p>
              <p>
                Oscar was born in England and moved to New Zealand at a young
                age, separating him from his extended family and making him, his
                parents and brothers very close. Because of this, he believes
                family is the most special thing one can have and a
                non-biological family’s he found in Kirwee Players, can be just
                as good. Oscar’s goal for Academe is to create such a family
                environment.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.person}>
          <h4>Bruce Chen</h4>
          <p>
            <em>Marketing & Finance Director</em>
          </p>
          <div className={styles.body}>
            <img src={bruce_chen} alt="Bruce Chen" />
            <div className={styles.description}>
              <p>
                Bruce is the silent worker in the team. He always does
                everything to the best of his abilities and has a strong passion
                for his work. He enjoys designing and creating things, which
                include Art, Digital Design and Web Development. His talents on
                a computer have led him through several extraordinary projects
                which have helped many people, which he enjoys thoroughly.
                Outside of school, Bruce also enjoys music, playing the violin,
                piano and organ. He is involved with Orchestras (including the
                NZSSSO), Chamber Orchestra and sometimes his Chamber Music
                group.
              </p>
              <p>
                As the person always keen on managing and planning, Bruce,
                coupled with his technological skills often organised events
                such as the 40-hour famine and a clothes drive in
                primary/intermediate school. However, Bruce is critical and
                alert of his environment, and the many problems that society has
                today. He has attended Model United Nation and Model European
                Union conferences, many debates and numerous other academic
                competitions. Having come to New Zealand at the age of 6 with no
                English ability and moving schools 4 times in primary school, he
                has now learned to adapt to new environments. He is flexible,
                and extremely capable in most things he puts his mind to.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.person}>
          <h4>Isaac Heap</h4>
          <p>
            <em>Sales & Production Director</em>
          </p>
          <div className={styles.body}>
            <img src={isaac_heap} alt="Isaac Heap" />
            <div className={styles.description}>
              <p>
                Isaac is the primary ‘idea guy’. He is very good at coming up
                with new, innovative ideas. Isaac’s incredible grasp on typical
                subjects such as mathematics and english is mirrored by his
                ability in others such as philosophy, politics, and debating,
                just to name a few. His vast web of connections is also very
                useful in making business arrangements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
