import { Button } from "@/components/ui/button";
import "./card.css";
import custom from "./custom.module.css";
export default function Card() {
  return (
    <>
      <div className={`card ${custom.card}`}>Card</div>
      <Button>Card</Button>
    </>
  );
}
